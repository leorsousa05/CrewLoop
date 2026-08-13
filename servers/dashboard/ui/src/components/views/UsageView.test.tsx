import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DailyUsageController } from '../../hooks/useDailyUsage';
import type { ProductUsageRow, UsageComparisonResponse } from '../../lib/usage';
import { UsageContent } from './UsageView';

function row(overrides: Partial<ProductUsageRow> = {}): ProductUsageRow {
  return {
    product: 'codex',
    date: null,
    tokenUsage: {
      inputTokens: 75,
      outputTokens: 25,
      cacheReadTokens: 10,
      cacheWriteTokens: 0,
      reasoningTokens: 5,
      totalTokens: 100,
    },
    availability: 'measured',
    measurementCount: 1,
    estimatedCostUsd: 0.02,
    costQuality: 'estimated',
    pricedTokens: 100,
    totalTokens: 100,
    lastMeasurementAt: 1000,
    ...overrides,
  };
}

function response(products: ProductUsageRow[], daily: ProductUsageRow[] = []): UsageComparisonResponse {
  return {
    generatedAt: 1000,
    range: { from: '2026-08-04', to: '2026-08-10', timeZone: 'America/Sao_Paulo' },
    products,
    daily,
  };
}

function controller(overrides: Partial<DailyUsageController> = {}): DailyUsageController {
  return {
    data: null,
    loading: false,
    refreshing: false,
    stale: false,
    error: null,
    lastSuccessAt: null,
    announcement: '',
    resetting: false,
    resetError: null,
    refresh: vi.fn(),
    reset: vi.fn(async () => true),
    clearResetError: vi.fn(),
    ...overrides,
  };
}

describe('UsageContent', () => {
  it('renders accessible loading and initial error states without fake totals', () => {
    const loading = renderToStaticMarkup(<UsageContent range="30d" onRangeChange={vi.fn()} controller={controller({ loading: true })} />);
    expect(loading).toContain('Loading usage history');
    expect(loading).toContain('aria-busy="true"');

    const error = renderToStaticMarkup(<UsageContent range="30d" onRangeChange={vi.fn()} controller={controller({ error: 'database unavailable' })} />);
    expect(error).toContain('Usage history could not be loaded');
    expect(error).toContain('Retry');
    expect(error).not.toContain('Total tokens');
  });

  it('renders all products, exact table data, cost qualification, and partial coverage', () => {
    const aggregate = row();
    const daily = row({ date: '2026-08-10' });
    const html = renderToStaticMarkup(
      <UsageContent
        range="7d"
        onRangeChange={vi.fn()}
        controller={controller({ data: response([aggregate], [daily]), lastSuccessAt: 2000 })}
      />
    );
    expect(html).toContain('Product comparison');
    expect(html).toContain('Daily token usage by coding-agent product');
    expect(html).toContain('Estimated API-equivalent USD');
    expect(html).toContain('Partial telemetry coverage');
    for (const product of ['Codex', 'Kimi', 'Claude', 'OpenCode', 'AGY']) expect(html).toContain(product);
    expect(html).toContain('Ongoing');
  });

  it('renders measured zero as zero and missing telemetry as No telemetry', () => {
    const zero = row({
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
    const html = renderToStaticMarkup(<UsageContent range="30d" onRangeChange={vi.fn()} controller={controller({ data: response([zero]) })} />);
    expect(html).toContain('>0<');
    expect(html).toContain('No telemetry');
    expect(html).not.toContain('No persisted token telemetry yet');
  });

  it('renders a true empty state when every product is unavailable', () => {
    const html = renderToStaticMarkup(<UsageContent range="30d" onRangeChange={vi.fn()} controller={controller({ data: response([]) })} />);
    expect(html).toContain('No persisted token telemetry yet');
    expect((html.match(/No telemetry/g) ?? []).length).toBe(5);
  });
});
