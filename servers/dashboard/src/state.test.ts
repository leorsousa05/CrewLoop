import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StateStore } from './state';
import type { DashboardEvent } from './types';

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
    assert.equal(session.events.length, 1);
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

  it('sets active skill when event carries skill', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ skill: 'architect', event_type: 'skill_change' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.active_skill, 'architect');
    assert.equal(session.active_confidence, 'explicit');
  });

  it('sets explicit active skill from session_start event', () => {
    const store = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 60000 });
    store.applyEvent(makeEvent({ skill: 'crewloop-hub', event_type: 'session_start' }));
    const session = store.getSession('sess-1')!;
    assert.equal(session.active_skill, 'crewloop-hub');
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
