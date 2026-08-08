import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptySessionTokenUsage,
  mergeTokenUsage,
  normalizeTokenUsage,
  presentTokenUsage,
  validateTokenUsageMeasurement,
  type TokenUsageAliases,
} from './token-usage';
import type { TokenUsageMeasurement } from '../types';

const aliases: TokenUsageAliases = {
  input: ['input_tokens', 'promptTokens'],
  output: ['output_tokens', 'completionTokens'],
  cacheRead: ['cache_read_input_tokens', 'cachedTokens'],
  cacheWrite: ['cache_creation_input_tokens'],
  reasoning: ['reasoning_tokens'],
  total: ['total_tokens', 'totalTokens'],
};

function measurement(
  overrides: Partial<TokenUsageMeasurement> = {}
): TokenUsageMeasurement {
  return {
    inputTokens: 100,
    outputTokens: 50,
    cacheReadTokens: 20,
    cacheWriteTokens: 0,
    reasoningTokens: 10,
    totalTokens: 150,
    measurementId: 'm-1',
    capturedAt: 1000,
    source: 'codex',
    model: 'gpt-test',
    quality: 'measured',
    semantics: 'delta',
    ...overrides,
  };
}

describe('normalizeTokenUsage', () => {
  it('normalizes snake-case counters and preserves provider total', () => {
    const result = normalizeTokenUsage({
      source: 'codex',
      rawUsage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 20,
        reasoning_tokens: 10,
        total_tokens: 145,
      },
      model: 'gpt-test',
      eventId: 'm-1',
      capturedAt: 1000,
      semantics: 'cumulative',
      aliases,
    });

    assert.ok(result);
    assert.equal(result.totalTokens, 145);
    assert.equal(result.cacheReadTokens, 20);
    assert.equal(result.reasoningTokens, 10);
    assert.equal(result.quality, 'measured');
  });

  it('supports aliases and falls back to input plus output', () => {
    const result = normalizeTokenUsage({
      source: 'kimi',
      rawUsage: { promptTokens: 80, completionTokens: 20, cachedTokens: 30 },
      eventId: 'm-2',
      capturedAt: 1001,
      semantics: 'delta',
      aliases,
    });

    assert.ok(result);
    assert.equal(result.inputTokens, 80);
    assert.equal(result.outputTokens, 20);
    assert.equal(result.totalTokens, 100);
    assert.equal(result.cacheReadTokens, 30);
  });

  it('returns undefined for absent and malformed counters', () => {
    assert.equal(normalizeTokenUsage({
      source: 'codex',
      rawUsage: {},
      eventId: 'm-1',
      capturedAt: 1000,
      semantics: 'delta',
      aliases,
    }), undefined);

    for (const invalid of [-1, 1.5, Number.POSITIVE_INFINITY, '10']) {
      assert.equal(normalizeTokenUsage({
        source: 'codex',
        rawUsage: { input_tokens: invalid },
        eventId: 'm-1',
        capturedAt: 1000,
        semantics: 'delta',
        aliases,
      }), undefined);
    }
  });

  it('does not double-count diagnostic subsets in computed total', () => {
    const result = normalizeTokenUsage({
      source: 'codex',
      rawUsage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 40,
        reasoning_tokens: 25,
      },
      eventId: 'm-1',
      capturedAt: 1000,
      semantics: 'delta',
      aliases,
    });
    assert.equal(result?.totalTokens, 150);
  });
});

describe('mergeTokenUsage', () => {
  it('adds a delta measurement once', () => {
    const first = mergeTokenUsage(createEmptySessionTokenUsage(), measurement());
    assert.equal(first.accepted, true);
    assert.equal(first.aggregate.totalTokens, 150);
    assert.equal(first.aggregate.quality, 'measured');

    const duplicate = mergeTokenUsage(first.aggregate, measurement());
    assert.equal(duplicate.accepted, false);
    assert.equal(duplicate.reason, 'duplicate');
    assert.equal(duplicate.aggregate.totalTokens, 150);
  });

  it('adds only the positive difference for cumulative snapshots', () => {
    const first = mergeTokenUsage(
      createEmptySessionTokenUsage(),
      measurement({ semantics: 'cumulative' })
    );
    const second = mergeTokenUsage(
      first.aggregate,
      measurement({
        measurementId: 'm-2',
        capturedAt: 2000,
        semantics: 'cumulative',
        inputTokens: 160,
        outputTokens: 90,
        cacheReadTokens: 40,
        reasoningTokens: 20,
        totalTokens: 250,
      })
    );

    assert.equal(second.aggregate.inputTokens, 160);
    assert.equal(second.aggregate.outputTokens, 90);
    assert.equal(second.aggregate.totalTokens, 250);
  });

  it('keeps one Codex cumulative cursor when optional model metadata appears later', () => {
    const fallback = mergeTokenUsage(
      createEmptySessionTokenUsage(),
      measurement({
        model: undefined,
        semantics: 'cumulative',
      })
    );
    const direct = mergeTokenUsage(
      fallback.aggregate,
      measurement({
        measurementId: 'm-2',
        capturedAt: 2000,
        model: 'gpt-test',
        semantics: 'cumulative',
      })
    );

    assert.equal(direct.aggregate.totalTokens, 150);
    assert.equal(direct.aggregate.model, 'gpt-test');
    assert.deepEqual(Object.keys(direct.aggregate.cursors), ['codex:session']);
  });

  it('treats a newer lower cumulative total as a counter reset', () => {
    const first = mergeTokenUsage(
      createEmptySessionTokenUsage(),
      measurement({ semantics: 'cumulative', totalTokens: 150 })
    );
    const reset = mergeTokenUsage(
      first.aggregate,
      measurement({
        measurementId: 'm-2',
        capturedAt: 2000,
        semantics: 'cumulative',
        inputTokens: 20,
        outputTokens: 10,
        cacheReadTokens: 0,
        reasoningTokens: 0,
        totalTokens: 30,
      })
    );
    assert.equal(reset.aggregate.totalTokens, 180);
  });

  it('ignores stale cumulative snapshots', () => {
    const first = mergeTokenUsage(
      createEmptySessionTokenUsage(),
      measurement({ capturedAt: 2000, semantics: 'cumulative' })
    );
    const stale = mergeTokenUsage(
      first.aggregate,
      measurement({
        measurementId: 'm-2',
        capturedAt: 1000,
        semantics: 'cumulative',
      })
    );
    assert.equal(stale.accepted, false);
    assert.equal(stale.reason, 'stale');
  });

  it('rejects invalid normalized measurements', () => {
    const invalid = { ...measurement(), totalTokens: -1 };
    assert.equal(validateTokenUsageMeasurement(invalid), undefined);
    const merged = mergeTokenUsage(
      createEmptySessionTokenUsage(),
      invalid as TokenUsageMeasurement
    );
    assert.equal(merged.accepted, false);
    assert.equal(merged.reason, 'invalid');
  });

  it('presents counts without internal cursors or identifiers', () => {
    const merged = mergeTokenUsage(createEmptySessionTokenUsage(), measurement());
    const client = presentTokenUsage(merged.aggregate);
    assert.equal(client.totalTokens, 150);
    assert.equal('cursors' in client, false);
    assert.equal('measurementIds' in client, false);
  });
});
