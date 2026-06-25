import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAgy } from './agy';

describe('normalizeAgy', () => {
  it('maps PreToolUse to tool_start', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      sessionId: 'sess-1',
      toolName: 'Read',
    });
    assert.equal(event?.event_type, 'tool_start');
    assert.equal(event?.tool, 'Read');
    assert.equal(event?.session_id, 'sess-1');
    assert.equal(event?.source, 'agy');
  });

  it('maps PostToolUse to tool_end', () => {
    const event = normalizeAgy({
      hook_event_name: 'PostToolUse',
      session_id: 'sess-2',
      toolCall: { name: 'Bash', args: { command: 'ls' } },
    });
    assert.equal(event?.event_type, 'tool_end');
    assert.equal(event?.tool, 'Bash');
  });

  it('maps SessionStart to session_start', () => {
    const event = normalizeAgy({
      hook_event_name: 'SessionStart',
      sessionId: 'sess-3',
    });
    assert.equal(event?.event_type, 'session_start');
  });

  it('maps Stop to session_end', () => {
    const event = normalizeAgy({
      hook_event_name: 'Stop',
      sessionId: 'sess-4',
    });
    assert.equal(event?.event_type, 'session_end');
  });

  it('returns undefined for unknown event name', () => {
    const event = normalizeAgy({
      hook_event_name: 'UnknownEvent',
      sessionId: 'sess-5',
    });
    assert.equal(event, undefined);
  });

  it('prefers toolName over toolCall.name', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      sessionId: 'sess-6',
      toolName: 'Read',
      toolCall: { name: 'Bash' },
    });
    assert.equal(event?.tool, 'Read');
  });

  it('falls back to session_id snake_case', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      session_id: 'sess-7',
      toolName: 'Read',
    });
    assert.equal(event?.session_id, 'sess-7');
  });

  it('falls back to conversationId when sessionId is absent', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      conversationId: 'conv-1',
      toolName: 'Read',
    });
    assert.equal(event?.session_id, 'conv-1');
  });
});
