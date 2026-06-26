import { describe, it, expect } from 'vitest';
import { buildOptions, filterInvocations, filterSessions, filterGraph } from './filter';
import type { AgentSource, ClientSession, EventStatus } from '../../../src/types';
import type { ToolInvocation } from '../../../src/lib/invocations';
import type { Graph3D } from '../../../src/lib/graph';
import { DEFAULT_FILTER_STATE } from './types';

function makeSession(id: string, source: ClientSession['source'], overrides?: Partial<ClientSession>): ClientSession {
  return {
    id,
    source,
    lifecycle: 'running',
    events: [],
    startTime: 0,
    lastActivity: 1000,
    toolCounts: {},
    ...overrides,
  } as ClientSession;
}

function makeInv(tool: string, overrides?: Partial<ToolInvocation>): ToolInvocation {
  return {
    id: Math.random().toString(),
    tool,
    eventType: 'tool_end',
    status: 'success',
    startTime: 500,
    ...overrides,
  } as ToolInvocation;
}

describe('filter', () => {
  it('builds options from selected session', () => {
    const session = makeSession('s1', 'kimi', {
      activeSkill: { name: 'engineer', confidence: 'explicit' },
      events: [{ id: 'e1', timestamp: 0, event_type: 'tool_end', tool: 'Read' }],
    });
    const sessions = new Map<string, ClientSession>([['s1', session]]);
    expect(buildOptions(sessions, 's1')).toEqual({
      sources: ['kimi'],
      skills: ['engineer'],
      statuses: [],
      tools: ['Read'],
      opTypes: ['read'],
    });
  });

  it('filters invocations by tool and status', () => {
    const invs = [
      makeInv('Read', { status: 'success' }),
      makeInv('Edit', { status: 'error' }),
      makeInv('Bash', { status: 'running' }),
    ];
    const filters = { ...DEFAULT_FILTER_STATE, tools: ['Read', 'Edit'], statuses: ['success' as EventStatus] };
    expect(filterInvocations(invs, undefined, filters, 1000)).toHaveLength(1);
  });

  it('filters invocations by time range', () => {
    const invs = [
      makeInv('Read', { startTime: 64000 }),
      makeInv('Edit', { startTime: 100 }),
    ];
    const filters = { ...DEFAULT_FILTER_STATE, timeRange: '1m' as const };
    expect(filterInvocations(invs, undefined, filters, 65000)).toHaveLength(1);
  });

  it('filters sessions by source and pin order', () => {
    const a = makeSession('a', 'kimi', { lastActivity: 2000 });
    const b = makeSession('b', 'codex', { lastActivity: 3000 });
    const filters = { ...DEFAULT_FILTER_STATE, sources: ['kimi', 'codex'] as AgentSource[] };
    const result = filterSessions([a, b], filters, [{ id: 'a', pinnedAt: 0 }], 4000);
    expect(result.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('filters graph while keeping skill root', () => {
    const graph: Graph3D = {
      nodes: [
        { id: 'skill:eng', type: 'skill', label: 'engineer', weight: 1 },
        { id: 'tool:Read', type: 'tool', label: 'Read', weight: 1 },
        { id: 'tool:Edit', type: 'tool', label: 'Edit', weight: 1 },
        { id: 'file:a', type: 'file', label: 'a', weight: 1 },
      ],
      links: [
        { source: 'skill:eng', target: 'tool:Read', weight: 1 },
        { source: 'skill:eng', target: 'tool:Edit', weight: 1 },
        { source: 'tool:Read', target: 'file:a', weight: 1 },
      ],
    };
    const invs = [makeInv('Read'), makeInv('Edit')];
    const filters = { ...DEFAULT_FILTER_STATE, tools: ['Read'] };
    const result = filterGraph(graph, invs, filters);
    expect(result.nodes.map((n) => n.id).sort()).toEqual(['file:a', 'skill:eng', 'tool:Read']);
    expect(result.links).toHaveLength(2);
  });
});
