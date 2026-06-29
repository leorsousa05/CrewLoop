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
    const event = makeEvent({ default_skill: 'orchestrator' });
    const session = store.applyEvent(event);
    assert.strictEqual(session.active_skill, 'orchestrator');
    assert.strictEqual(session.active_confidence, 'heuristic');
  });

  it('ignores default_skill when an active skill is already set', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    store.applyEvent(makeEvent({ skill: 'architect' }));
    const session = store.applyEvent(makeEvent({ default_skill: 'orchestrator' }));
    assert.strictEqual(session.active_skill, 'architect');
  });

  it('overrides active skill with an explicit skill signal', () => {
    const store = new StateStore(DEFAULT_OPTIONS);
    store.applyEvent(makeEvent({ default_skill: 'orchestrator' }));
    const session = store.applyEvent(makeEvent({ skill: 'engineer' }));
    assert.strictEqual(session.active_skill, 'engineer');
    assert.strictEqual(session.active_confidence, 'heuristic');
  });
});
