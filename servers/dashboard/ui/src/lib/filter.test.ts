import { describe, it, expect } from 'vitest';
import { buildOptions, filterInvocations, filterSessions, sortSessions } from './filter';
import type { AgentSource, ClientSession, EventStatus } from '../../../src/types';
import type { ToolInvocation } from '../../../src/lib/invocations';
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

  it('sortSessions keeps pins first and sorts unpinned by key', () => {
    const a = makeSession('a', 'kimi', {
      lastActivity: 1000,
      startTime: 0,
      endedAt: 5000,
      events: [{ id: 'e1', timestamp: 0, event_type: 'tool_end', tool: 'Read' }],
    });
    const b = makeSession('b', 'codex', { lastActivity: 3000, startTime: 0, endedAt: 1000 });
    const c = makeSession('c', 'claude', {
      lastActivity: 2000,
      startTime: 0,
      events: [
        { id: 'e1', timestamp: 0, event_type: 'tool_end', tool: 'Read' },
        { id: 'e2', timestamp: 1, event_type: 'tool_end', tool: 'Edit' },
      ],
    });
    const pins = [{ id: 'a', pinnedAt: 0 }];
    expect(sortSessions([a, b, c], 'recent', pins, 10000).map((s) => s.id)).toEqual(['a', 'b', 'c']);
    expect(sortSessions([a, b, c], 'duration', [], 10000).map((s) => s.id)).toEqual(['c', 'a', 'b']);
    expect(sortSessions([a, b, c], 'events', [], 10000).map((s) => s.id)).toEqual(['c', 'a', 'b']);
  });

  it('sortSessions sorts by name case-insensitively', () => {
    const a = makeSession('a', 'kimi', { activeSkill: { name: 'Zebra', confidence: 'explicit' } });
    const b = makeSession('b', 'codex', { activeSkill: { name: 'apple', confidence: 'explicit' } });
    expect(sortSessions([a, b], 'name', [], 10000).map((s) => s.id)).toEqual(['b', 'a']);
  });
});
