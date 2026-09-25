import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateDashboardEvent } from './event-contract';

const validEvent = {
  id: 'event-1',
  timestamp: 1_000,
  source: 'codex',
  session_id: 'session-1',
  event_type: 'tool_start',
  tool: 'Read',
};

describe('validateDashboardEvent', () => {
  it('accepts the canonical minimal event', () => {
    assert.equal(validateDashboardEvent(validEvent), true);
  });

  it('rejects malformed identity, enum, numeric, and payload fields', () => {
    const invalidEvents = [
      { ...validEvent, id: '' },
      { ...validEvent, timestamp: -1 },
      { ...validEvent, source: 'unknown-agent' },
      { ...validEvent, event_type: 'tool_event' },
      { ...validEvent, duration_ms: Number.NaN },
      { ...validEvent, input: [] },
      { ...validEvent, workspacePath: 'relative/workspace' },
      { ...validEvent, unexpected: true },
    ];

    for (const event of invalidEvents) {
      assert.equal(validateDashboardEvent(event), false, JSON.stringify(event));
    }
  });

  it('allows invalid token measurements to reach the telemetry fallback', () => {
    assert.equal(
      validateDashboardEvent({ ...validEvent, token_usage: { inputTokens: -1 } }),
      true
    );
  });
});
