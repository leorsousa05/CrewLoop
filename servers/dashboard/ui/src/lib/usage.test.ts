import { describe, expect, it } from 'vitest';
import {
  buildDailyUsageUrl,
  buildUsageViewModel,
  parseUsageComparisonResponse,
  type ProductUsageRow,
  type UsageComparisonResponse,
} from './usage';

function row(overrides: Partial<ProductUsageRow> = {}): ProductUsageRow {
  return {
    product: 'codex',
    date: null,
    tokenUsage: {
      inputTokens: 60,
      outputTokens: 40,
      cacheReadTokens: 20,
      cacheWriteTokens: 0,
      reasoningTokens: 10,
      totalTokens: 100,
    },
    availability: 'measured',
    measurementCount: 1,
    estimatedCostUsd: 0.01,
    costQuality: 'estimated',
    pricedTokens: 100,
    totalTokens: 100,
    lastMeasurementAt: 1000,
    ...overrides,
  };
}

function response(products: ProductUsageRow[]): UsageComparisonResponse {
  return {
    generatedAt: 1000,
    range: { from: '2026-08-01', to: '2026-08-10', timeZone: 'America/Sao_Paulo' },
    products,
    daily: [],
  };
}

describe('usage response parsing', () => {
  it('accepts the approved aggregate contract and rejects malformed counts', () => {
    expect(parseUsageComparisonResponse(response([row()]))).toEqual(response([row()]));
    expect(parseUsageComparisonResponse({
      ...response([row()]),
      products: [row({ tokenUsage: { ...row().tokenUsage!, totalTokens: -1 } })],
    })).toBeUndefined();
  });

  it('requires aggregate rows to have null dates and daily rows to have dates', () => {
    expect(parseUsageComparisonResponse({
      ...response([]),
      products: [row({ date: '2026-08-10' })],
    })).toBeUndefined();
    expect(parseUsageComparisonResponse({
      ...response([]),
      daily: [row({ date: null })],
    })).toBeUndefined();
  });
});

describe('usage view model', () => {
  it('sorts measured products by total and appends every unavailable product', () => {
    const model = buildUsageViewModel(response([
      row({ product: 'kimi', totalTokens: 250, tokenUsage: { ...row().tokenUsage!, totalTokens: 250 } }),
      row({ product: 'codex', totalTokens: 100 }),
    ]));
    expect(model.products.map((product) => product.product)).toEqual(['kimi', 'codex', 'claude', 'opencode', 'agy']);
    expect(model.summary.totalTokens).toBe(350);
    expect(model.summary.reportingProducts).toBe(2);
    expect(model.unavailableProducts).toEqual(['claude', 'opencode', 'agy']);
  });

  it('keeps measured zero distinct from unavailable telemetry', () => {
    const measuredZero = row({
      product: 'agy',
      totalTokens: 0,
      estimatedCostUsd: null,
      pricedTokens: 0,
      costQuality: 'unavailable',
      tokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        reasoningTokens: 0,
        totalTokens: 0,
      },
    });
    const model = buildUsageViewModel(response([measuredZero]));
    expect(model.isEmpty).toBe(false);
    expect(model.summary.reportingProducts).toBe(1);
    expect(model.products.find((product) => product.product === 'agy')?.tokenUsage).not.toBeNull();
    expect(model.products.find((product) => product.product === 'claude')?.tokenUsage).toBeNull();
  });

  it('marks incomplete pricing as mixed and exposes coverage', () => {
    const model = buildUsageViewModel(response([
      row({ totalTokens: 100, pricedTokens: 50, costQuality: 'estimated' }),
      row({ product: 'kimi', totalTokens: 100, pricedTokens: 0, estimatedCostUsd: null, costQuality: 'unavailable' }),
    ]));
    expect(model.summary.costQuality).toBe('mixed');
    expect(model.summary.costCoverage).toBe(0.25);
  });
});

describe('daily usage URL', () => {
  it('uses the server default for the initial 30-day load', () => {
    expect(buildDailyUsageUrl('30d')).toBe('/api/usage/daily');
  });

  it('builds inclusive finite dates and the approved all-history selector', () => {
    expect(buildDailyUsageUrl('7d', { timeZone: 'UTC', now: Date.UTC(2026, 7, 10) }))
      .toBe('/api/usage/daily?from=2026-08-04&to=2026-08-10');
    expect(buildDailyUsageUrl('all')).toBe('/api/usage/daily?range=all');
  });
});
