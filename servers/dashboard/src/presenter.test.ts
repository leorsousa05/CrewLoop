import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { presentSession, presentState, createSnapshotMessage, createUpdateMessage } from './presenter';
import type { Session, ClientUpdateMessage } from './types';
import { createEmptySessionTokenUsage } from './telemetry/token-usage';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'sess-1',
    source: 'kimi',
    events: [],
    tool_counts: { Read: 2 },
    token_usage: createEmptySessionTokenUsage(),
    started_at: 1000,
    last_event_at: 2000,
    active_skill: 'crewloop:plan',
    active_confidence: 'explicit',
    status: 'running',
    lifecycle: 'running',
    ...overrides,
  };
}

describe('presenter', () => {
  it('converts session to client shape', () => {
    const session = makeSession();
    const client = presentSession(session);

    assert.equal(client.id, 'sess-1');
    assert.equal(client.source, 'kimi');
    assert.equal(client.skill, 'crewloop:plan');
    assert.deepEqual(client.activeSkill, { name: 'crewloop:plan', confidence: 'explicit' });
    assert.equal(client.status, 'running');
    assert.equal(client.lifecycle, 'running');
    assert.equal(client.startTime, 1000);
    assert.equal(client.lastActivity, 2000);
    assert.deepEqual(client.toolCounts, { Read: 2 });
  });

  it('includes lifecycle and endedAt', () => {
    const client = presentSession(makeSession({ lifecycle: 'ended', ended_at: 5000 }));
    assert.equal(client.lifecycle, 'ended');
    assert.equal(client.endedAt, 5000);
  });

  it('presents token totals without internal cursor state', () => {
    const token_usage = createEmptySessionTokenUsage();
    token_usage.quality = 'measured';
    token_usage.totalTokens = 500;
    token_usage.inputTokens = 400;
    token_usage.outputTokens = 100;
    token_usage.measurementCount = 1;
    token_usage.measurementIds = ['private-id'];
    token_usage.cursors = {
      'kimi:kimi-test': {
        capturedAt: 1000,
        counts: {
          inputTokens: 400,
          outputTokens: 100,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          reasoningTokens: 0,
          totalTokens: 500,
        },
      },
    };
    const client = presentSession(makeSession({ token_usage }));
    assert.equal(client.tokenUsage?.totalTokens, 500);
    assert.equal('cursors' in (client.tokenUsage || {}), false);
    assert.equal('measurementIds' in (client.tokenUsage || {}), false);
  });

  it('omits active skill when not set', () => {
    const client = presentSession(makeSession({ active_skill: undefined }));
    assert.equal(client.activeSkill, undefined);
    assert.equal(client.skill, undefined);
  });

  it('presents state as client sessions', () => {
    const state = {
      sessions: {
        'sess-1': makeSession(),
      },
    };
    const sessions = presentState(state);
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].id, 'sess-1');
  });

  it('creates snapshot message', () => {
    const message = createSnapshotMessage([makeSession()]);
    assert.equal(message.type, 'snapshot');
    assert.equal(message.sessions.length, 1);
    assert.equal(message.sessions[0].id, 'sess-1');
  });

  it('creates update message with isActive flag', () => {
    const message = createUpdateMessage(makeSession(), 'sess-1') as ClientUpdateMessage;
    assert.equal(message.type, 'update');
    assert.equal(message.session.id, 'sess-1');
    assert.equal(message.isActive, true);

    const inactive = createUpdateMessage(makeSession(), 'sess-2') as ClientUpdateMessage;
    assert.equal(inactive.isActive, false);
  });
});
