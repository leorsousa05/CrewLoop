import { useEffect, useMemo, useState } from 'react';
import type { ClientSession, ClientTokenUsage } from '../../../src/types';
import { formatDuration } from '../../../src/lib/format';
import { download, toJson, tokenFilename, toTokenSessionReport } from '../lib/export';
import { Icon } from './ui/Icon';

interface Props {
  session: ClientSession | undefined;
}

export function formatTokenCount(value: number): string {
  if (value >= 1_000_000) {
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  }
  if (value >= 1_000) {
    return `${Number((value / 1_000).toFixed(1))}K`;
  }
  return String(value);
}

function QualityBadge({ usage }: { usage: ClientTokenUsage | undefined }) {
  if (!usage || usage.quality === 'unavailable') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-warning">
        <Icon name="Warning" className="w-3 h-3" aria-hidden="true" />
        UNAVAILABLE
      </span>
    );
  }
  if (usage.rejectedMeasurementCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-warning">
        <Icon name="WarningCircle" className="w-3 h-3" aria-hidden="true" />
        PARTIAL
      </span>
    );
  }
  const measured = usage.quality === 'measured';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest ${measured ? 'text-success' : 'text-running'}`}>
      <Icon name={measured ? 'CheckCircle' : 'Info'} className="w-3 h-3" aria-hidden="true" />
      {usage.quality.toUpperCase()}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded border border-border-default bg-elevated px-2.5 py-2">
      <span
        className="font-mono text-base font-semibold tabular text-text-primary"
        aria-label={`${value.toLocaleString('en-US')} ${label.toLowerCase()} tokens`}
      >
        {formatTokenCount(value)}
      </span>
      <span className="text-[9px] uppercase tracking-widest text-text-muted">{label}</span>
    </div>
  );
}

export function TelemetryPanel({ session }: Props) {
  const [now, setNow] = useState(Date.now());
  const [exportState, setExportState] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const toolEvents = useMemo(
    () => (session?.events || []).filter((event) => event.event_type === 'tool_start' || event.event_type === 'tool_end'),
    [session]
  );
  const toolCount = Math.ceil(toolEvents.length / 2);

  const eventRate = useMemo(() => {
    const windowStart = now - 60000;
    return (session?.events || []).filter((event) => event.timestamp > windowStart).length;
  }, [session, now]);

  const duration = useMemo(() => {
    if (!session) return 0;
    const end = session.endedAt || session.lastActivity || now;
    return end - session.startTime;
  }, [session, now]);

  const usage = session?.tokenUsage;
  const available = Boolean(usage && usage.quality !== 'unavailable');
  const metrics = usage
    ? [
        { label: 'Input', value: usage.inputTokens, show: true },
        { label: 'Output', value: usage.outputTokens, show: true },
        { label: 'Cache read', value: usage.cacheReadTokens, show: usage.cacheReadTokens > 0 },
        { label: 'Cache write', value: usage.cacheWriteTokens, show: usage.cacheWriteTokens > 0 },
        { label: 'Reasoning', value: usage.reasoningTokens, show: usage.reasoningTokens > 0 },
      ].filter((metric) => metric.show)
    : [];

  function exportRun(): void {
    if (!session || !available) return;
    try {
      download(toJson(toTokenSessionReport(session)), tokenFilename(session.id));
      setExportState('success');
      window.setTimeout(() => setExportState('idle'), 1500);
    } catch {
      setExportState('error');
    }
  }

  return (
    <section className="panel h-full p-4 flex flex-col gap-3" aria-labelledby="token-telemetry-title">
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-border-default">
        <div className="min-w-0">
          <h2 id="token-telemetry-title" className="font-display text-base font-medium uppercase tracking-[0.12em] text-text-primary">
            Token telemetry
          </h2>
          {usage?.model && (
            <p className="truncate text-[10px] text-text-muted" title={usage.model}>
              {usage.model}
            </p>
          )}
        </div>
        {session && <QualityBadge usage={usage} />}
      </div>

      {!session ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <Icon name="Gauge" className="w-6 h-6 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No session selected</p>
          <p className="text-xs text-text-muted">Select a session to inspect token usage.</p>
        </div>
      ) : available && usage ? (
        <div className="flex-1 min-h-0 flex flex-col gap-2" aria-live="polite">
          <div className="rounded border border-border-default bg-inset px-3 py-2">
            <span
              className="font-display text-[44px] leading-none text-accent tabular"
              aria-label={`${usage.totalTokens.toLocaleString('en-US')} total tokens`}
            >
              {formatTokenCount(usage.totalTokens)}
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] uppercase tracking-widest text-text-muted">Total tokens</span>
              <span className="text-[9px] text-text-muted">provider reported</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto">
            {metrics.map((metric) => <Metric key={metric.label} {...metric} />)}
          </div>
          {usage.rejectedMeasurementCount > 0 && (
            <p className="text-[10px] text-warning">
              {usage.rejectedMeasurementCount} measurement(s) rejected
            </p>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <Icon name="Warning" className="w-6 h-6 text-warning" aria-hidden="true" />
          <p className="text-sm text-text-secondary">Token usage was not reported by this agent.</p>
        </div>
      )}

      {session && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-default">
          <span className="text-[10px] text-text-muted tabular">
            {toolCount} tools · {formatDuration(duration)} · {eventRate}/min
          </span>
          <button
            type="button"
            onClick={exportRun}
            disabled={!available}
            className="min-h-11 inline-flex items-center gap-1.5 rounded border border-border-default px-3 text-xs font-semibold text-text-secondary enabled:hover:border-accent enabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name={exportState === 'success' ? 'Check' : 'DownloadSimple'}
              className="w-4 h-4"
              aria-hidden="true"
            />
            {exportState === 'success' ? 'Exported' : 'Export run'}
          </button>
          {exportState === 'error' && (
            <p className="basis-full inline-flex items-center gap-1 text-[10px] text-error">
              <Icon name="WarningCircle" className="w-3 h-3" aria-hidden="true" />
              Export failed
            </p>
          )}
        </div>
      )}
    </section>
  );
}
