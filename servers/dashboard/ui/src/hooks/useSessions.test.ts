import { describe, expect, it } from 'vitest';
import type { ClientSession } from '../../../src/types';
import { defaultSelected } from './useSessions';

function session(id: string, lastActivity: number): ClientSession {
  return {
    id,
    source: 'codex',
    lifecycle: 'running',
    events: [],
    startTime: 0,
    lastActivity,
    toolCounts: {},
  };
}

describe('session selection fallback', () => {
  it('keeps the selected session while it exists', () => {
    const sessions = new Map([['a', session('a', 1)], ['b', session('b', 2)]]);
    expect(defaultSelected(sessions, 'b', 'a')).toBe('a');
  });

  it('falls back to the newest session with a stable id tie-breaker', () => {
    const sessions = new Map([['z', session('z', 5)], ['a', session('a', 5)], ['old', session('old', 1)]]);
    expect(defaultSelected(sessions, undefined, 'removed')).toBe('a');
  });
});
