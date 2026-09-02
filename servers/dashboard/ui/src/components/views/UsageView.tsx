import { useEffect, useMemo, useRef, useState } from 'react';
import { sourceIcon } from '../../../../src/lib/constants';
import { useDailyUsage, type DailyUsageController } from '../../hooks/useDailyUsage';
import type { UsageRange } from '../../lib/types';
import {
  CODING_AGENT_PRODUCTS,
  buildUsageViewModel,
  formatCompactTokens,
  formatExactTokens,
  formatProduct,
  formatUsd,
  type CodingAgentProduct,
  type ProductUsageRow,
  type UsageViewModel,
} from '../../lib/usage';
import { Icon } from '../ui/Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const RANGE_OPTIONS: Array<{ value: UsageRange; label: string; shortLabel: string }> = [
  { value: '7d', label: '7 days', shortLabel: '7D' },
  { value: '30d', label: '30 days', shortLabel: '30D' },
  { value: '90d', label: '90 days', shortLabel: '90D' },
  { value: 'all', label: 'All history', shortLabel: 'ALL' },
];

const SERIES: Record<CodingAgentProduct, { dash?: string; marker: 'circle' | 'square' | 'triangle' | 'diamond' | 'cross'; opacity: number }> = {
  codex: { marker: 'circle', opacity: 1 },
  kimi: { dash: '10 5', marker: 'square', opacity: 0.86 },
  claude: { dash: '5 4', marker: 'triangle', opacity: 0.74 },
  opencode: { dash: '2 4', marker: 'diamond', opacity: 0.64 },
  agy: { dash: '8 3 2 3', marker: 'cross', opacity: 0.54 },
};

type TrendMetric = 'tokens' | 'cost';

interface UsageContentProps {
  range: UsageRange;
  onRangeChange: (range: UsageRange) => void;
  controller: DailyUsageController;
}

export function UsageView({ range, onRangeChange }: { range: UsageRange; onRangeChange: (range: UsageRange) => void }) {
  const controller = useDailyUsage(range);
  return <UsageContent range={range} onRangeChange={onRangeChange} controller={controller} />;
}

export function UsageContent({ range, onRangeChange, controller }: UsageContentProps) {
  const [metric, setMetric] = useState<TrendMetric>('tokens');
  const [resetOpen, setResetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { onKeyDown: onDialogTrapKeyDown } = useFocusTrap({
    open: resetOpen,
    containerRef: dialogRef,
    initialFocusRef: cancelRef,
    restoreFocusRef: triggerRef,
  });
  const model = useMemo(() => controller.data ? buildUsageViewModel(controller.data) : null, [controller.data]);

  function closeReset() {
    if (controller.resetting) return;
    setResetOpen(false);
    controller.clearResetError();
    triggerRef.current?.focus();
  }

  async function confirmReset() {
    if (await controller.reset()) {
      setResetOpen(false);
      triggerRef.current?.focus();
    }
  }

  const everyCostUnavailable = !model || model.products.every((row) => row.estimatedCostUsd === null);
  useEffect(() => {
    if (everyCostUnavailable && metric === 'cost') setMetric('tokens');
  }, [everyCostUnavailable, metric]);

  return (
    <div className="h-full overflow-y-auto" aria-busy={controller.loading || controller.refreshing}>
      <div className="p-4 md:p-6 flex flex-col gap-4 max-w-[1600px]">
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <h1 className="font-display text-display-lg font-semibold text-text-primary">Usage</h1>
            <p className="text-body text-text-secondary mt-1">
              Daily consumption by coding-agent product
              {controller.data ? ` · ${controller.data.range.timeZone}` : ' · local timezone'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Usage date range" className="flex rounded border border-border-default bg-surface overflow-hidden">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={range === option.value}
                  onClick={() => onRangeChange(option.value)}
                  className={`min-h-11 px-3 border-r last:border-r-0 border-border-default text-label transition-colors ${
                    range === option.value
                      ? 'bg-accent-subtle text-accent'
                      : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                  }`}
                  title={option.label}
                >
                  <span className="sm:hidden">{option.shortLabel}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={controller.refresh}
              disabled={controller.loading || controller.refreshing}
              aria-label="Refresh usage history"
              title="Refresh usage history"
              className="btn-ghost min-w-11 min-h-11 justify-center !px-0 disabled:opacity-50"
            >
              <Icon name="ArrowClockwise" className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div aria-live="polite" className="sr-only">{controller.announcement}</div>

        {controller.stale && (
          <StatusBanner tone="warning" title="Stale usage data">
            The refresh failed. The last successful comparison remains visible.{' '}
            <button type="button" onClick={controller.refresh} className="min-h-11 underline text-text-primary">Retry</button>
          </StatusBanner>
        )}

        {controller.loading && <UsageSkeleton />}

        {!controller.loading && !model && controller.error && (
          <section className="panel border-error/40" role="alert">
            <h2 className="font-display text-heading">Usage history could not be loaded.</h2>
            <p className="text-body text-text-secondary mt-2">{controller.error}</p>
            <button type="button" onClick={controller.refresh} className="btn-ghost mt-3 min-h-11">Retry</button>
          </section>
        )}

        {model && (
          <>
            {model.unavailableProducts.length > 0 && !model.isEmpty && (
              <StatusBanner tone="warning" title="Partial telemetry coverage">
                No token counters were reported for {model.unavailableProducts.map(formatProduct).join(', ')}. Measured products remain comparable.
              </StatusBanner>
            )}

            {model.isEmpty && (
              <section className="panel flex gap-3 items-start">
                <Icon name="Database" className="w-6 h-6 text-text-muted flex-shrink-0" />
                <div>
                  <h2 className="font-display text-heading">No persisted token telemetry yet.</h2>
                  <p className="text-body text-text-secondary mt-1">Supported agents appear here when verified token counters arrive.</p>
                </div>
              </section>
            )}

            <SummaryStrip model={model} lastSuccessAt={controller.lastSuccessAt} stale={controller.stale} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <ProductComparison model={model} />
              <DailyTrend
                model={model}
                metric={metric}
                onMetricChange={setMetric}
                costUnavailable={everyCostUnavailable}
              />
            </div>

            <DailyDetail model={model} />

            <div className="flex justify-end">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => {
                  controller.clearResetError();
                  setResetOpen(true);
                }}
                className="min-h-11 px-3 inline-flex items-center gap-2 rounded border border-error/40 text-label text-error hover:bg-error/10"
              >
                <Icon name="Trash" className="w-4 h-4" />
                Clear history
              </button>
            </div>
          </>
        )}
      </div>

      {resetOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="presentation">
          <button className="absolute inset-0 bg-black/60" aria-label="Cancel clearing usage history" onClick={closeReset} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-usage-title"
            aria-describedby="reset-usage-description"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && !controller.resetting) {
                event.preventDefault();
                event.stopPropagation();
                closeReset();
                return;
              }
              onDialogTrapKeyDown(event);
            }}
            className="relative w-full max-w-md rounded-lg border border-border-strong bg-surface p-5 shadow-modal animate-modal-in"
          >
            <h2 id="reset-usage-title" className="font-display text-heading">Clear usage history?</h2>
            <p id="reset-usage-description" className="text-body text-text-secondary mt-2">
              This removes persisted token measurements and comparisons for all products. It cannot be undone. Live agent events are not deleted.
            </p>
            {controller.resetError && <p className="mt-3 text-label text-error" role="alert">{controller.resetError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button ref={cancelRef} type="button" onClick={closeReset} disabled={controller.resetting} className="btn-ghost min-h-11 disabled:opacity-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmReset()}
                disabled={controller.resetting}
                className="min-h-11 px-4 rounded bg-error text-white text-label font-semibold disabled:opacity-50"
              >
                {controller.resetting ? 'Clearing…' : 'Clear history'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBanner({ tone, title, children }: { tone: 'warning' | 'error'; title: string; children: React.ReactNode }) {
  const color = tone === 'warning' ? 'border-warning/40 text-warning' : 'border-error/40 text-error';
  return (
    <div className={`border rounded px-4 py-3 flex gap-3 ${color}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name="Warning" className="w-5 h-5 flex-shrink-0" />
      <div>
        <strong className="text-label text-text-primary">{title}</strong>
        <div className="text-label text-text-secondary mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function UsageSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-label="Loading usage history">
      <div className="h-24 panel bg-elevated animate-shimmer" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="h-72 panel bg-elevated animate-shimmer" />
        <div className="h-72 panel bg-elevated animate-shimmer" />
      </div>
      <div className="h-48 panel bg-elevated animate-shimmer" />
    </div>
  );
}

function SummaryStrip({ model, lastSuccessAt, stale }: { model: UsageViewModel; lastSuccessAt: number | null; stale: boolean }) {
  const { summary } = model;
  const costLabel = summary.estimatedCostUsd === null ? 'Unavailable' : formatUsd(summary.estimatedCostUsd);
  const quality = summary.costQuality === 'unavailable'
    ? 'Unavailable'
    : summary.costQuality === 'mixed'
      ? `Partial estimate · ${Math.round(summary.costCoverage * 100)}% token coverage`
      : 'Complete estimate';
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-border-default rounded bg-surface overflow-hidden" aria-label="Usage summary">
      <SummaryMetric label="Total tokens" value={formatCompactTokens(summary.totalTokens)} detail={formatExactTokens(summary.totalTokens)} />
      <SummaryMetric label="Reporting products" value={`${summary.reportingProducts} of ${CODING_AGENT_PRODUCTS.length}`} detail="Products with token telemetry" />
      <SummaryMetric label="Estimated API-equivalent USD" value={costLabel} detail={quality} warning={summary.costQuality === 'mixed'} />
      <SummaryMetric
        label="Last updated"
        value={lastSuccessAt ? new Date(lastSuccessAt).toLocaleTimeString() : 'Unavailable'}
        detail={stale ? 'Stale · retry available' : model.response.range.timeZone}
        warning={stale}
      />
    </section>
  );
}

function SummaryMetric({ label, value, detail, warning = false }: { label: string; value: string; detail: string; warning?: boolean }) {
  return (
    <div className="min-h-[92px] px-4 py-3 border-b sm:border-b-0 sm:border-r last:border-r-0 border-border-default">
      <div className="text-caption uppercase tracking-wide text-text-muted">{label}</div>
      <div className="font-mono text-display-lg font-semibold tabular mt-1" title={detail}>{value}</div>
      <div className={`text-caption mt-1 ${warning ? 'text-warning' : 'text-text-muted'}`}>{detail}</div>
    </div>
  );
}

function ProductComparison({ model }: { model: UsageViewModel }) {
  const max = Math.max(0, ...model.products.map((row) => row.totalTokens ?? 0));
  return (
    <section className="panel xl:col-span-5 !p-0">
      <h2 className="font-display text-heading px-4 py-3 border-b border-border-default">Product comparison</h2>
      <div className="p-4 flex flex-col gap-3">
        {model.products.map((row) => {
          const unavailable = row.tokenUsage === null;
          const total = row.totalTokens ?? row.tokenUsage?.totalTokens ?? 0;
          const width = max > 0 ? Math.max(total === 0 ? 1 : 2, (total / max) * 100) : 1;
          return (
            <div key={row.product} className={unavailable ? 'rounded bg-inset px-3 py-2' : 'px-3 py-2'}>
              <div className="flex items-center gap-2">
                <Icon name={sourceIcon(row.product)} className="w-4 h-4 text-text-secondary" />
                <span className="text-label text-text-primary">{formatProduct(row.product)}</span>
                <span className={`ml-auto text-caption tabular ${unavailable ? 'text-text-muted' : 'text-text-secondary'}`}>
                  {unavailable ? 'No telemetry' : formatExactTokens(total)}
                </span>
              </div>
              {!unavailable && (
                <div className="mt-2 h-2 bg-inset border border-border-default" aria-hidden="true">
                  <div className="h-full bg-accent" style={{ width: `${width}%` }} />
                </div>
              )}
              {!unavailable && (
                <div className="mt-1 flex justify-between text-caption text-text-muted">
                  <span>{row.availability === 'partial' ? 'Partial telemetry' : 'Measured'}</span>
                  <span>{row.estimatedCostUsd === null ? 'Cost unavailable' : `${formatUsd(row.estimatedCostUsd)} API-equivalent`}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DailyTrend({ model, metric, onMetricChange, costUnavailable }: { model: UsageViewModel; metric: TrendMetric; onMetricChange: (metric: TrendMetric) => void; costUnavailable: boolean }) {
  const rows = model.daily.filter((row) => row.tokenUsage !== null && (metric === 'tokens' || row.estimatedCostUsd !== null));
  const dates = [...new Set(rows.map((row) => row.date as string))].sort();
  const max = Math.max(0, ...rows.map((row) => metric === 'tokens' ? (row.totalTokens ?? 0) : (row.estimatedCostUsd ?? 0)));
  const chartWidth = 760;
  const chartHeight = 220;
  const plot = { left: 48, top: 18, width: 680, height: 160 };
  const x = (date: string) => dates.length <= 1 ? plot.left + plot.width / 2 : plot.left + (dates.indexOf(date) / (dates.length - 1)) * plot.width;
  const y = (value: number) => plot.top + plot.height - (max === 0 ? 0 : value / max) * plot.height;
  const highest = rows.reduce<ProductUsageRow | null>((best, row) => {
    const value = metric === 'tokens' ? (row.totalTokens ?? 0) : (row.estimatedCostUsd ?? 0);
    const bestValue = best ? (metric === 'tokens' ? (best.totalTokens ?? 0) : (best.estimatedCostUsd ?? 0)) : -1;
    return value > bestValue ? row : best;
  }, null);

  return (
    <section className="panel xl:col-span-7 !p-0">
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between gap-3">
        <h2 className="font-display text-heading">Daily trend</h2>
        <select
          value={metric}
          onChange={(event) => onMetricChange(event.target.value as TrendMetric)}
          aria-label="Trend metric"
          className="min-h-11 px-3 rounded border border-border-default bg-elevated text-label"
        >
          <option value="tokens">Tokens</option>
          <option value="cost" disabled={costUnavailable}>Estimated USD{costUnavailable ? ' — unavailable' : ''}</option>
        </select>
      </div>
      <div className="p-4 overflow-x-auto" tabIndex={0} aria-label="Daily usage trend chart">
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3" aria-label="Chart legend">
          {CODING_AGENT_PRODUCTS.map((product) => (
            <span key={product} className="inline-flex items-center gap-1.5 text-caption text-text-secondary">
              <svg width="26" height="8" aria-hidden="true"><line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeDasharray={SERIES[product].dash} /></svg>
              {formatProduct(product)}
            </span>
          ))}
        </div>
        {rows.length === 0 ? (
          <div className="h-52 bg-inset border border-border-default flex items-center justify-center text-body text-text-muted">No daily measurements in this range.</div>
        ) : (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[680px] w-full" role="img" aria-labelledby="usage-chart-title usage-chart-desc">
            <title id="usage-chart-title">{`Daily ${metric === 'tokens' ? 'token' : 'estimated cost'} usage by product`}</title>
            <desc id="usage-chart-desc">
              {highest ? `${formatProduct(highest.product)} has the highest visible point on ${highest.date}. Missing telemetry is omitted rather than shown as zero.` : 'No measured usage.'}
            </desc>
            {[0, 0.5, 1].map((ratio) => (
              <g key={ratio}>
                <line x1={plot.left} x2={plot.left + plot.width} y1={plot.top + plot.height * ratio} y2={plot.top + plot.height * ratio} stroke="var(--border-default)" />
                <text x={plot.left - 8} y={plot.top + plot.height * ratio + 4} textAnchor="end" fill="var(--text-muted)" fontSize="10">
                  {metric === 'tokens' ? formatCompactTokens(max * (1 - ratio)) : formatUsd(max * (1 - ratio))}
                </text>
              </g>
            ))}
            {CODING_AGENT_PRODUCTS.map((product) => {
              const productRows = rows.filter((row) => row.product === product).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
              const points = productRows.map((row) => ({
                row,
                x: x(row.date as string),
                y: y(metric === 'tokens' ? (row.totalTokens ?? 0) : (row.estimatedCostUsd ?? 0)),
              }));
              return (
                <g key={product} opacity={SERIES[product].opacity}>
                  {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray={SERIES[product].dash} />}
                  {points.map((point) => (
                    <ChartMarker key={point.row.date} product={product} x={point.x} y={point.y} label={`${formatProduct(product)}, ${point.row.date}: ${metric === 'tokens' ? formatExactTokens(point.row.totalTokens ?? 0) + ' tokens' : formatUsd(point.row.estimatedCostUsd ?? 0)}`} />
                  ))}
                </g>
              );
            })}
            {dates[0] && <text x={plot.left} y={205} fill="var(--text-muted)" fontSize="10">{dates[0]}</text>}
            {dates.length > 1 && <text x={plot.left + plot.width} y={205} textAnchor="end" fill="var(--text-muted)" fontSize="10">{dates[dates.length - 1]} · Ongoing</text>}
          </svg>
        )}
      </div>
    </section>
  );
}

function ChartMarker({ product, x, y, label }: { product: CodingAgentProduct; x: number; y: number; label: string }) {
  const marker = SERIES[product].marker;
  const common = { fill: 'var(--bg-surface)', stroke: 'var(--accent)', strokeWidth: 2 };
  return (
    <g tabIndex={0} role="img" aria-label={label}>
      <title>{label}</title>
      {marker === 'circle' && <circle cx={x} cy={y} r="4" {...common} />}
      {marker === 'square' && <rect x={x - 4} y={y - 4} width="8" height="8" {...common} />}
      {marker === 'triangle' && <path d={`M ${x} ${y - 5} L ${x + 5} ${y + 4} L ${x - 5} ${y + 4} Z`} {...common} />}
      {marker === 'diamond' && <path d={`M ${x} ${y - 5} L ${x + 5} ${y} L ${x} ${y + 5} L ${x - 5} ${y} Z`} {...common} />}
      {marker === 'cross' && <path d={`M ${x - 4} ${y - 4} L ${x + 4} ${y + 4} M ${x + 4} ${y - 4} L ${x - 4} ${y + 4}`} fill="none" stroke="var(--accent)" strokeWidth="2" />}
    </g>
  );
}

function DailyDetail({ model }: { model: UsageViewModel }) {
  const rows = [...model.daily].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.product.localeCompare(b.product));
  return (
    <section className="panel !p-0">
      <h2 className="font-display text-heading px-4 py-3 border-b border-border-default">Daily detail</h2>
      <div className="overflow-x-auto" tabIndex={0}>
        <table className="w-full min-w-[1120px] text-label tabular">
          <caption className="sr-only">Daily token usage by coding-agent product for {model.response.range.from} through {model.response.range.to} in {model.response.range.timeZone}</caption>
          <thead className="bg-elevated text-text-muted uppercase tracking-wide">
            <tr>
              {['Date', 'Product', 'Quality', 'Total', 'Input', 'Output', 'Cache Read', 'Cache Write', 'Reasoning', 'Estimated API USD'].map((label) => (
                <th key={label} scope="col" className={`px-3 py-2 border-b border-border-default ${['Date', 'Product', 'Quality'].includes(label) ? 'text-left' : 'text-right'}`}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-text-muted">No daily measurements in this range.</td></tr>
            ) : rows.map((row) => (
              <tr key={`${row.date}:${row.product}`} className="border-b border-border-default last:border-b-0">
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{row.date}{row.date === model.response.range.to ? ' · Ongoing' : ''}</td>
                <td className="px-3 py-2 text-text-primary">{formatProduct(row.product)}</td>
                <td className="px-3 py-2 text-text-secondary">{row.availability === 'unavailable' ? 'Unavailable' : row.availability}</td>
                <TokenCell value={row.totalTokens} />
                <TokenCell value={row.tokenUsage?.inputTokens ?? null} />
                <TokenCell value={row.tokenUsage?.outputTokens ?? null} />
                <TokenCell value={row.tokenUsage?.cacheReadTokens ?? null} />
                <TokenCell value={row.tokenUsage?.cacheWriteTokens ?? null} />
                <TokenCell value={row.tokenUsage?.reasoningTokens ?? null} />
                <td className="px-3 py-2 text-right">{row.estimatedCostUsd === null ? 'Unavailable' : formatUsd(row.estimatedCostUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TokenCell({ value }: { value: number | null }) {
  return <td className="px-3 py-2 text-right">{value === null ? 'Unavailable' : formatExactTokens(value)}</td>;
}
