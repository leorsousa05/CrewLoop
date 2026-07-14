import type { AgentSource, ClientSession, EventStatus } from '../../../src/types';
import type { ToolInvocation } from '../../../src/lib/invocations';
import { operationType } from '../../../src/lib/invocations';
import type { FilterOptions, FilterState, PinnedSession, SessionSortKey, TimeRange } from './types';
import { matchesInvocation } from './search';

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

export function sortSessions(
  sessions: ClientSession[],
  key: SessionSortKey,
  pins: PinnedSession[],
  now: number
): ClientSession[] {
  const pinOrder = new Map(pins.map((p, i) => [p.id, i]));

  const byKey = (a: ClientSession, b: ClientSession): number => {
    switch (key) {
      case 'duration': {
        const durA = (a.endedAt ?? now) - a.startTime;
        const durB = (b.endedAt ?? now) - b.startTime;
        return durB - durA;
      }
      case 'events':
        return b.events.length - a.events.length;
      case 'name': {
        const nameA = (a.activeSkill?.name || a.skill || a.id).toLowerCase();
        const nameB = (b.activeSkill?.name || b.skill || b.id).toLowerCase();
        return nameA.localeCompare(nameB);
      }
      case 'recent':
      default:
        return (b.lastActivity || 0) - (a.lastActivity || 0);
    }
  };

  return [...sessions].sort((a, b) => {
    const aPin = pinOrder.has(a.id);
    const bPin = pinOrder.has(b.id);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    if (aPin && bPin) {
      return (pinOrder.get(a.id) ?? 0) - (pinOrder.get(b.id) ?? 0);
    }
    return byKey(a, b);
  });
}
