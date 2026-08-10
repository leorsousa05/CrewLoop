import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeAgy } from './agy';
import { normalizeClaude } from './claude';
import { normalizeCodex } from './codex';
import { normalizeKimi } from './kimi';
import { normalizeOpenCode } from './opencode';

describe('durable direct collector identities', () => {
  it('keeps Codex and Kimi cumulative identities replay-stable and session-private', () => {
    const codexPayload = {
      hook_event_name: 'Stop',
      sessionId: 'private-codex-session',
      callId: 'call-1',
      timestamp: '2026-08-10T10:00:00.000Z',
      usage: { inputTokens: 90, outputTokens: 10, totalTokens: 100 },
    };
    const kimiPayload = {
      hook_event_name: 'Stop',
      session_id: 'private-kimi-session',
      cwd: '/synthetic',
      turn_id: 'turn-1',
      timestamp: '2026-08-10T10:00:00.000Z',
      usage: { input_tokens: 80, output_tokens: 20, total_tokens: 100 },
    };

    const codex = normalizeCodex(codexPayload)?.token_usage;
    const codexReplay = normalizeCodex(codexPayload)?.token_usage;
    const kimi = normalizeKimi(kimiPayload)?.token_usage;
    const kimiReplay = normalizeKimi(kimiPayload)?.token_usage;

    assert.ok(codex);
    assert.ok(codexReplay);
    assert.ok(kimi);
    assert.ok(kimiReplay);

    assert.equal(codex.measurementId, codexReplay.measurementId);
    assert.equal(kimi.measurementId, kimiReplay.measurementId);
    assert.equal(codex.cursorKey, 'codex:direct-session');
    assert.equal(kimi.cursorKey, 'kimi:direct-session');
    assert.doesNotMatch(codex.measurementId, /private-codex-session/);
    assert.doesNotMatch(kimi.measurementId, /private-kimi-session/);
  });
});

describe('Claude usage collection', () => {
  it('normalizes direct counters only with a stable message identity', () => {
    const payload = {
      hook_event_name: 'SessionEnd',
      session_id: 'claude-session',
      message_id: 'msg-1',
      timestamp: '2026-08-10T11:00:00.000Z',
      model: 'claude-synthetic',
      usage: {
        input_tokens: 70,
        output_tokens: 30,
        cache_read_input_tokens: 20,
        cache_creation_input_tokens: 10,
      },
    };
    const event = normalizeClaude(payload);
    const replay = normalizeClaude(payload);

    assert.equal(event?.token_usage?.totalTokens, 130);
    assert.equal(event?.token_usage?.measurementId, replay?.token_usage?.measurementId);
    assert.equal(event?.token_usage?.semantics, 'delta');
    assert.equal(
      normalizeClaude({ ...payload, message_id: undefined })?.token_usage,
      undefined
    );
  });
});

describe('OpenCode usage collection', () => {
  const payload = {
    event_type: 'model_usage' as const,
    session_id: 'session-open',
    message_id: 'msg-open-1',
    captured_at: 1_786_360_000_000,
    final: true,
    model: 'model-open',
    cost_usd: 0.012345,
    usage: {
      input: 100,
      output: 25,
      reasoning: 5,
      cache_read: 20,
      cache_write: 4,
    },
  };

  it('normalizes final message usage and provider-reported cost once', () => {
    const event = normalizeOpenCode(payload);
    const replay = normalizeOpenCode(payload);

    assert.equal(event?.token_usage?.totalTokens, 125);
    assert.equal(event?.token_usage?.reportedCostMicrousd, 12_345);
    assert.equal(event?.token_usage?.measurementId, replay?.token_usage?.measurementId);
    assert.equal(event?.token_usage?.cursorKey, 'opencode:message');
  });

  it('keeps streaming or malformed counters unavailable', () => {
    assert.equal(normalizeOpenCode({ ...payload, final: false })?.token_usage, undefined);
    assert.equal(
      normalizeOpenCode({ ...payload, usage: { input: '100', output: 25 } })?.token_usage,
      undefined
    );
  });
});

describe('AGY AfterModel usage collection', () => {
  const payload = {
    hook_event_name: 'AfterModel',
    session_id: 'agy-session',
    responseId: 'response-1',
    timestamp: '2026-08-10T12:00:00.000Z',
    llm_request: { model: 'gemini-synthetic' },
    llm_response: {
      candidates: [{ finishReason: 'STOP' }],
      usageMetadata: {
        promptTokenCount: 80,
        candidatesTokenCount: 20,
        cachedContentTokenCount: 10,
        thoughtsTokenCount: 5,
        totalTokenCount: 100,
      },
    },
  };

  it('normalizes only positive final response usage', () => {
    const event = normalizeAgy(payload);
    const replay = normalizeAgy(payload);

    assert.equal(event?.tool, 'Model');
    assert.equal(event?.token_usage?.totalTokens, 100);
    assert.equal(event?.token_usage?.measurementId, replay?.token_usage?.measurementId);
    assert.equal(event?.token_usage?.cursorKey, 'agy:model-response');
    assert.equal(event?.output, undefined);
  });

  it('ignores streaming chunks and zero totals', () => {
    assert.equal(
      normalizeAgy({
        ...payload,
        llm_response: { ...payload.llm_response, candidates: [{}] },
      }),
      undefined
    );
    assert.equal(
      normalizeAgy({
        ...payload,
        llm_response: {
          ...payload.llm_response,
          usageMetadata: { totalTokenCount: 0 },
        },
      }),
      undefined
    );
  });
});
