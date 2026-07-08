import assert from 'node:assert';
import { describe, it } from 'node:test';
import { StateStore } from '../state';
import type { DashboardEvent } from '../types';

function makeEvent(overrides: Partial<DashboardEvent>): DashboardEvent {
  return {
    id: 'e1',
    timestamp: Date.now(),
    source: 'agy',
    session_id: 's1',
    event_type: 'tool_start',
    tool: 'Bash',
    ...overrides,
  };
}

const DEFAULT_OPTIONS = { maxEventsPerSession: 100, sessionMaxAgeMs: 1000 * 60 * 60 };

describe('StateStore default_skill fallback', () => {
  it('applies default_skill when no active skill exists', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    const event = makeEvent({ default_skill: 'crewloop-hub' });
    const session = store.applyEvent(event);
    assert.strictEqual(session.active_skill, 'crewloop-hub');
    assert.strictEqual(session.active_confidence, 'heuristic');
  });

  it('ignores default_skill when an active skill is already set', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    store.applyEvent(makeEvent({ skill: 'architect' }));
    const session = store.applyEvent(makeEvent({ default_skill: 'crewloop-hub' }));
    assert.strictEqual(session.active_skill, 'architect');
  });

  it('overrides active skill with an explicit skill signal', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    store.applyEvent(makeEvent({ default_skill: 'crewloop-hub' }));
    const session = store.applyEvent(makeEvent({ skill: 'engineer' }));
    assert.strictEqual(session.active_skill, 'engineer');
    assert.strictEqual(session.active_confidence, 'heuristic');
  });
});

describe('StateStore session lifecycle', () => {
  it('synthesizes a session_start before the first tool event (lazy start)', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    const session = store.applyEvent(makeEvent({ event_type: 'tool_start', tool: 'Read' }));

    assert.strictEqual(session.events.length, 2);
    // Events are stored newest-first: [tool_start, synthesized session_start].
    assert.strictEqual(session.events[1].event_type, 'session_start');
    assert.strictEqual(session.events[0].event_type, 'tool_start');
    assert.strictEqual(session.lifecycle, 'running');
  });

  it('does not synthesize session_start when the agent emits one', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    const session = store.applyEvent(makeEvent({ event_type: 'session_start', tool: undefined }));
    assert.strictEqual(session.events.length, 1);
    assert.strictEqual(session.events[0].event_type, 'session_start');
  });

  it('synthesizes session_start only once per session', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    store.applyEvent(makeEvent({ id: 'e1', event_type: 'tool_start' }));
    const session = store.applyEvent(makeEvent({ id: 'e2', event_type: 'tool_end' }));
    const starts = session.events.filter((e) => e.event_type === 'session_start');
    assert.strictEqual(starts.length, 1);
  });

  it('marks idle sessions as ended after the timeout', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    const now = Date.now();
    store.applyEvent(makeEvent({ timestamp: now - 60_000 }));

    const ended = store.markIdleSessionsEnded(30_000, now);
    assert.strictEqual(ended.length, 1);
    assert.strictEqual(ended[0].lifecycle, 'ended');
    assert.strictEqual(ended[0].ended_at, now - 60_000);
  });

  it('leaves active and already-ended sessions untouched', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    const now = Date.now();
    store.applyEvent(makeEvent({ session_id: 'fresh', timestamp: now }));
    store.applyEvent(
      makeEvent({ session_id: 'closed', event_type: 'session_end', timestamp: now - 60_000 })
    );

    const ended = store.markIdleSessionsEnded(30_000, now);
    assert.strictEqual(ended.length, 0);
    assert.strictEqual(store.getSession('fresh')!.lifecycle, 'running');
  });
});
