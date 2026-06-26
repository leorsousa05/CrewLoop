import type { AgentSource, ClientSession, EventStatus } from '../../../src/types';
import type { ToolInvocation } from '../../../src/lib/invocations';
import type { Graph3D, GraphNode, GraphLink } from '../../../src/lib/graph';
import { operationType } from '../../../src/lib/invocations';
import type { FilterOptions, FilterState, PinnedSession, TimeRange } from './types';
import { matchesInvocation } from './search';

function linkEndpointId(endpoint: string | { id?: unknown } | number): string {
  if (typeof endpoint === 'string') return endpoint;
  if (endpoint && typeof endpoint === 'object' && 'id' in endpoint) return String(endpoint.id);
  return String(endpoint);
}

function timeRangeToMs(range: TimeRange): number | null {
  switch (range) {
    case '1m':
      return 60_000;
    case '5m':
      return 5 * 60_000;
    case '15m':
      return 15 * 60_000;
    case '1h':
      return 60 * 60_000;
    case '24h':
      return 24 * 60 * 60_000;
    default:
      return null;
  }
}

function isWithinTimeRange(timestamp: number, range: TimeRange, now: number, session?: ClientSession): boolean {
  if (range === 'all') return true;
  if (range === 'session') {
    if (!session) return true;
    const start = session.startTime;
    const end = session.endedAt || now;
    return timestamp >= start && timestamp <= end;
  }
  const ms = timeRangeToMs(range);
  if (ms == null) return true;
  return timestamp >= now - ms;
}

function uniqueSorted<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function buildOptions(
  sessions: Map<string, ClientSession>,
  selectedSessionId: string | null
): FilterOptions {
  const selected = selectedSessionId ? sessions.get(selectedSessionId) : undefined;
  const relevant = selected ? [selected] : Array.from(sessions.values());

  const sources = uniqueSorted<AgentSource>(relevant.map((s) => s.source));
  const skills = uniqueSorted<string>(
    relevant
      .flatMap((s) => [s.activeSkill?.name, s.skill].filter(Boolean) as string[])
  );
  const statuses = uniqueSorted<EventStatus>(
    relevant.map((s) => s.status).filter(Boolean) as EventStatus[]
  );
  const tools = uniqueSorted<string>(
    relevant
      .flatMap((s) => s.events)
      .filter((e) => e.tool)
      .map((e) => e.tool as string)
  );
  const opTypes = uniqueSorted<('read' | 'edit' | 'other')>(
    tools.map((t) => operationType(t))
  );

  return { sources, skills, statuses, tools, opTypes };
}

export function filterInvocations(
  invocations: ToolInvocation[],
  session: ClientSession | undefined,
  filters: FilterState,
  now: number
): ToolInvocation[] {
  return invocations.filter((inv) => {
    if (filters.query && !matchesInvocation(inv, filters.query)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(inv.status as EventStatus)) return false;
    if (filters.skills.length > 0 && !filters.skills.includes(inv.skill || '')) return false;
    if (filters.tools.length > 0 && !filters.tools.includes(inv.tool)) return false;
    if (filters.opTypes.length > 0 && !filters.opTypes.includes(operationType(inv.tool))) return false;
    if (!isWithinTimeRange(inv.startTime, filters.timeRange, now, session)) return false;
    return true;
  });
}

export function filterSessions(
  sessions: ClientSession[],
  filters: FilterState,
  pins: PinnedSession[],
  now: number
): ClientSession[] {
  const pinOrder = new Map(pins.map((p, i) => [p.id, i]));

  const filtered = sessions.filter((s) => {
    if (filters.sources.length > 0 && !filters.sources.includes(s.source)) return false;
    if (filters.skills.length > 0) {
      const skill = s.activeSkill?.name || s.skill;
      if (!skill || !filters.skills.includes(skill)) return false;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(s.status || 'running')) return false;
    if (!isWithinTimeRange(s.lastActivity, filters.timeRange, now, s)) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    const aPin = pinOrder.has(a.id);
    const bPin = pinOrder.has(b.id);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    if (aPin && bPin) {
      return (pinOrder.get(a.id) ?? 0) - (pinOrder.get(b.id) ?? 0);
    }
    return (b.lastActivity || 0) - (a.lastActivity || 0);
  });
}

export function filterGraph(
  graph: Graph3D,
  invocations: ToolInvocation[],
  filters: FilterState
): Graph3D {
  const query = filters.query.trim().toLowerCase();
  const toolSet = new Set(filters.tools);
  const opSet = new Set(filters.opTypes);

  const matchedTools = new Set<string>();
  for (const inv of invocations) {
    const keepTool =
      (toolSet.size === 0 || toolSet.has(inv.tool)) &&
      (opSet.size === 0 || opSet.has(operationType(inv.tool)));
    if (keepTool) matchedTools.add(`tool:${inv.tool}`);
  }

  const skillNodes = graph.nodes.filter((n) => n.type === 'skill');

  const keptNodes = new Map<string, GraphNode>();
  for (const n of skillNodes) keptNodes.set(n.id, n);

  const keptLinks: GraphLink[] = [];

  for (const n of graph.nodes) {
    if (n.type === 'tool') {
      const matchesTool = matchedTools.has(n.id);
      const matchesQuery = query ? n.label.toLowerCase().includes(query) : true;
      if (matchesTool && matchesQuery) keptNodes.set(n.id, n);
    }
  }

  for (const n of graph.nodes) {
    if (n.type === 'file') {
      const matchesQuery = query ? n.label.toLowerCase().includes(query) : true;
      if (!matchesQuery) continue;
      const hasToolLink = graph.links.some((l) => {
        const sourceId = linkEndpointId(l.source);
        const targetId = linkEndpointId(l.target);
        return keptNodes.has(sourceId) && targetId === n.id;
      });
      if (hasToolLink) keptNodes.set(n.id, n);
    }
  }

  for (const l of graph.links) {
    const sourceId = linkEndpointId(l.source);
    const targetId = linkEndpointId(l.target);
    if (keptNodes.has(sourceId) && keptNodes.has(targetId)) {
      keptLinks.push(l);
    }
  }

  return { nodes: Array.from(keptNodes.values()), links: keptLinks };
}
