import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CostEstimator } from './cost-estimator';

const counts = {
  inputTokens: 1_000_000,
  outputTokens: 100_000,
  cacheReadTokens: 100_000,
  cacheWriteTokens: 0,
  reasoningTokens: 50_000,
  totalTokens: 1_100_000,
};

describe('CostEstimator', () => {
  it('prefers immutable provider-reported cost', () => {
    const result = new CostEstimator().estimate({
      counts,
      localDate: '2026-08-10',
      model: 'gpt-5.6',
      reportedCostMicrousd: 123_456,
    });
    assert.deepEqual(result, {
      costMicrousd: 123_456,
      quality: 'reported',
      pricingVersion: null,
      pricedTokens: 1_100_000,
    });
  });

  it('uses Anthropic-exclusive cache counters and effective-dated model rates', () => {
    const claudeCounts = { ...counts, totalTokens: 1_200_000 };
    const before = new CostEstimator().estimate({
      counts: claudeCounts,
      localDate: '2026-08-31',
      model: 'claude-sonnet-5',
    });
    const after = new CostEstimator().estimate({
      counts: claudeCounts,
      localDate: '2026-09-01',
      model: 'claude-sonnet-5',
    });
    assert.equal(before.costMicrousd, 3_020_000);
    assert.equal(after.costMicrousd, 4_530_000);
    assert.equal(before.quality, 'estimated');
    assert.equal(before.pricingVersion, '2026-08-10');
    assert.equal(before.pricedTokens, 1_200_000);
  });

  it('subtracts cache categories from inclusive OpenAI input counters', () => {
    const result = new CostEstimator().estimate({
      counts,
      localDate: '2026-08-10',
      model: 'gpt-5.6-luna',
    });
    assert.equal(result.costMicrousd, 1_510_000);
  });

  it('returns unavailable for aliases that are not exact catalog matches', () => {
    const result = new CostEstimator().estimate({
      counts,
      localDate: '2026-08-10',
      model: 'gpt-5.6-latest',
    });
    assert.deepEqual(result, {
      costMicrousd: null,
      quality: 'unavailable',
      pricingVersion: null,
      pricedTokens: 0,
    });
  });
});
