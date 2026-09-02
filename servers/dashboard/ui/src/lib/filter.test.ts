import { describe, it, expect } from 'vitest';
import { buildOptions, filterInvocations, filterSessions, filterWorkspacePaths, sortSessions } from './filter';
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
      activeSkill: { name: 'crewloop:code', confidence: 'explicit' },
      events: [{ id: 'e1', timestamp: 0, event_type: 'tool_end', tool: 'Read', status: 'error', skill: 'crewloop:plan' }],
    });
    const sessions = new Map<string, ClientSession>([['s1', session]]);
    expect(buildOptions(sessions, 's1')).toEqual({
      sources: ['kimi'],
      skills: ['crewloop:code', 'crewloop:plan'],
      statuses: ['error'],
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

  it('filters selected-session invocations by source', () => {
    const inv = makeInv('Read');
    const session = makeSession('s1', 'codex');
    expect(filterInvocations([inv], session, { ...DEFAULT_FILTER_STATE, sources: ['kimi'] }, 1000)).toHaveLength(0);
    expect(filterInvocations([inv], session, { ...DEFAULT_FILTER_STATE, sources: ['codex'] }, 1000)).toHaveLength(1);
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

  it('applies query, tool, and operation filters to session results', () => {
    const session = makeSession('s1', 'codex', {
      skill: 'crewloop:code',
      events: [{
        id: 'end-1',
        timestamp: 900,
        event_type: 'tool_end',
        tool: 'Edit',
        status: 'success',
        skill: 'crewloop:code',
      }],
    });
    const sessions = [session];

    expect(filterSessions(sessions, { ...DEFAULT_FILTER_STATE, query: 'Edit' }, [], 1000)).toHaveLength(1);
    expect(filterSessions(sessions, { ...DEFAULT_FILTER_STATE, tools: ['Edit'] }, [], 1000)).toHaveLength(1);
    expect(filterSessions(sessions, { ...DEFAULT_FILTER_STATE, opTypes: ['edit'] }, [], 1000)).toHaveLength(1);
    expect(filterSessions(sessions, { ...DEFAULT_FILTER_STATE, query: 'missing' }, [], 1000)).toHaveLength(0);
  });

  it('matches a session when a historical invocation carries the selected status', () => {
    const session = makeSession('s1', 'codex', {
      status: 'success',
      events: [{ id: 'end-1', timestamp: 900, event_type: 'tool_end', tool: 'Edit', status: 'error' }],
    });
    expect(filterSessions([session], { ...DEFAULT_FILTER_STATE, statuses: ['error'] }, [], 1000)).toHaveLength(1);
  });

  it('filters untracked workspace paths by query and excludes them for event filters', () => {
    expect(filterWorkspacePaths(['src/app.ts', 'README.md'], { ...DEFAULT_FILTER_STATE, query: 'app' }))
      .toEqual(['src/app.ts']);
    expect(filterWorkspacePaths(['src/app.ts'], { ...DEFAULT_FILTER_STATE, tools: ['Read'] }))
      .toEqual([]);
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
