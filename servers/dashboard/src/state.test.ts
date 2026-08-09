import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StateStore } from './state';
import type { DashboardEvent } from './types';
import { createEmptySessionTokenUsage } from './telemetry/token-usage';

function makeEvent(overrides: Partial<DashboardEvent> = {}): DashboardEvent {
  return {
    id: 'ev-1',
    timestamp: Date.now(),
    source: 'kimi',
    session_id: 'sess-1',
    event_type: 'tool_start',
    tool: 'Read',
    ...overrides,
  };
}


describe('StateStore', () => {
  it('creates session on first event', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    const session = store.applyEvent(makeEvent());
    assert.equal(session.id, 'sess-1');
    assert.equal(session.source, 'kimi');
    // First event is a tool event, so a session_start is synthesized (lazy start).
    assert.equal(session.events.length, 2);
    assert.equal(session.events[1].event_type, 'session_start');
  });

  it('caps events per session', () => {
    const store = new StateStore({ maxEventsPerSession: 3, sessionMaxAgeMs: 60000 });
    for (let i = 0; i < 5; i++) {
      store.applyEvent(makeEvent({ id: `ev-${i}`, timestamp: Date.now() + i }));
    }
    const session = store.getSession('sess-1')!;
    assert.equal(session.events.length, 3);
  });

  it('counts tool usage', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ tool: 'Read' }));
    store.applyEvent(makeEvent({ tool: 'Read' }));
    store.applyEvent(makeEvent({ tool: 'Edit' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.tool_counts['Read'], 2);
    assert.equal(session.tool_counts['Edit'], 1);
  });

  it('stores security_decision events separately and caps them', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ tool: 'Read' }));
    store.applyEvent(
      makeEvent({
        event_type: 'security_decision',
        tool: 'Bash',
        detail: 'block',
        status: 'error',
      })
    );
    const session = store.getSession('sess-1')!;
    assert.equal(session.events.length, 2);
    assert.equal(session.security_decisions.length, 1);
    assert.equal(session.security_decisions[0].decision, 'block');
    assert.equal(session.security_decisions[0].tool, 'Bash');
  });

  it('aggregates token usage independently of the bounded event list', () => {
    const store = new StateStore({ maxEventsPerSession: 2, sessionMaxAgeMs: 60000 });
    for (let index = 1; index <= 4; index++) {
      store.applyEvent(makeEvent({
        id: `ev-${index}`,
        timestamp: 1000 + index,
        token_usage: {
          inputTokens: index * 100,
          outputTokens: index * 20,
          cacheReadTokens: index * 10,
          cacheWriteTokens: 0,
          reasoningTokens: 0,
          totalTokens: index * 120,
          measurementId: `m-${index}`,
          capturedAt: 1000 + index,
          source: 'kimi',
          quality: 'measured',
          semantics: 'cumulative',
        },
      }));
    }
    const session = store.getSession('sess-1')!;
    assert.equal(session.events.length, 2);
    assert.equal(session.token_usage.totalTokens, 480);
    assert.equal(session.token_usage.inputTokens, 400);
    assert.equal(session.token_usage.measurementCount, 4);
  });

  it('does not count the same token measurement twice', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    const token_usage = {
      inputTokens: 100,
      outputTokens: 20,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
      totalTokens: 120,
      measurementId: 'same',
      capturedAt: 1000,
      source: 'kimi' as const,
      quality: 'measured' as const,
      semantics: 'delta' as const,
    };
    store.applyEvent(makeEvent({ id: 'one', token_usage }));
    store.applyEvent(makeEvent({ id: 'two', token_usage }));
    assert.equal(store.getSession('sess-1')!.token_usage.totalTokens, 120);
  });

  it('initializes sessions with unavailable token telemetry', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent());
    assert.deepEqual(store.getSession('sess-1')!.token_usage, createEmptySessionTokenUsage());
  });

  it('sets active skill when event carries skill', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ skill: 'crewloop:plan', event_type: 'skill_change' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.active_skill, 'crewloop:plan');
    assert.equal(session.active_confidence, 'explicit');
  });

  it('sets explicit active skill from session_start event', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ skill: 'crewloop:plan', event_type: 'session_start' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.active_skill, 'crewloop:plan');
    assert.equal(session.active_confidence, 'explicit');
  });

  it('derives running status from tool_start', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ event_type: 'tool_start' }));
    assert.equal(store.getSession('sess-1')!.status, 'running');
  });

  it('derives success status from tool_end', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ event_type: 'tool_end', status: 'success' }));
    assert.equal(store.getSession('sess-1')!.status, 'success');
  });

  it('derives error status from failed tool_end', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ event_type: 'tool_end', status: 'error' }));
    assert.equal(store.getSession('sess-1')!.status, 'error');
  });

  it('prunes inactive sessions', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 1000 });
    store.applyEvent(makeEvent());
    const removed = store.pruneInactive(Date.now() + 2000);
    assert.equal(removed, 1);
    assert.equal(store.getSession('sess-1'), undefined);
  });

  it('returns sessions sorted by last event', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ session_id: 'a', timestamp: 1000 }));
    store.applyEvent(makeEvent({ session_id: 'b', timestamp: 2000 }));
    const sessions = store.getAllSessions();
    assert.equal(sessions[0].id, 'b');
    assert.equal(sessions[1].id, 'a');
  });

  it('starts with lifecycle starting on session_start', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ event_type: 'session_start' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.lifecycle, 'starting');
  });

  it('transitions to running on first tool event', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ event_type: 'session_start' }));
    store.applyEvent(makeEvent({ event_type: 'tool_start', tool: 'Read' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.lifecycle, 'running');
  });

  it('sets lifecycle ended and ended_at on session_end', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ event_type: 'session_start' }));
    const endTs = Date.now() + 1000;
    store.applyEvent(makeEvent({ event_type: 'session_end', timestamp: endTs }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.lifecycle, 'ended');
    assert.equal(session.ended_at, endTs);
  });

  it('keeps session ended after subsequent tool events', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ event_type: 'session_start' }));
    store.applyEvent(makeEvent({ event_type: 'session_end' }));
    store.applyEvent(makeEvent({ event_type: 'tool_start', tool: 'Read' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.lifecycle, 'ended');
  });
});
