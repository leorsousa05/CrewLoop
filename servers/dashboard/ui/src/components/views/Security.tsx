import { useMemo } from 'react';
import type { ClientSession, ClientSecurityDecision } from '../../../../src/types';
import { useSecurity } from '../../hooks/useSecurity';
import { Icon } from '../ui/Icon';
import { formatTime } from '../../../../src/lib/format';

interface Props {
  selectedSession: ClientSession | undefined;
}

function DecisionBadge({ decision }: { decision: 'allow' | 'block' }) {
  const color =
    decision === 'allow'
      ? 'text-success border-success/35'
      : 'text-error border-error/35';
  const dot = decision === 'allow' ? 'bg-success' : 'bg-error';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-micro font-semibold uppercase px-1.5 py-0.5 rounded border ${color}`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {decision}
    </span>
  );
}

function SummaryCard({ label, value, helper }: { label: string; value: React.ReactNode; helper?: React.ReactNode }) {
  return (
    <div className="panel flex flex-col gap-1 p-4">
      <span className="text-caption uppercase tracking-wide text-text-muted">{label}</span>
      <span className="text-display-lg font-bold text-text-primary">{value}</span>
      {helper && <span className="text-micro text-warning">{helper}</span>}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-3 text-center p-6">
      <Icon name="Shield" className="w-8 h-8 text-text-muted" />
      <h1 className="font-display text-display-lg text-text-primary">No security decisions yet</h1>
      <p className="text-body text-text-secondary max-w-sm">{message}</p>
    </div>
  );
}

function DecisionRow({ decision }: { decision: ClientSecurityDecision }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border-default last:border-0 hover:bg-elevated transition-colors cursor-default animate-row-in">
      <span className="text-micro text-text-muted tabular w-16 flex-shrink-0">
        {formatTime(decision.timestamp)}
      </span>
      <span className="font-mono text-body text-text-primary w-24 flex-shrink-0 truncate">
        {decision.tool}
      </span>
      <div className="w-20 flex-shrink-0">
        <DecisionBadge decision={decision.decision} />
      </div>
      <span className="text-label text-text-secondary w-32 flex-shrink-0 truncate">
        {decision.rule || '—'}
      </span>
      <span className="text-label text-text-secondary truncate min-w-0">
        {decision.reason || '—'}
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border-default last:border-0">
      <div className="w-16 h-3 bg-elevated rounded animate-shimmer" />
      <div className="w-24 h-3 bg-elevated rounded animate-shimmer" />
      <div className="w-20 h-3 bg-elevated rounded animate-shimmer" />
      <div className="w-32 h-3 bg-elevated rounded animate-shimmer" />
      <div className="flex-1 h-3 bg-elevated rounded animate-shimmer" />
    </div>
  );
}

export function Security({ selectedSession }: Props) {
  const { decisions, loading, error } = useSecurity(
    selectedSession?.id ?? null,
    selectedSession?.securityDecisions ?? []
  );

  const counts = useMemo(() => {
    return decisions.reduce(
      (acc, d) => {
        acc[d.decision]++;
        return acc;
      },
      { allow: 0, block: 0 }
    );
  }, [decisions]);

  if (!selectedSession) {
    return <EmptyState message="Select a session to view guard decisions." />;
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      {error && (
        <div className="mb-4 px-4 py-2 bg-error/10 border border-error/30 rounded-lg text-micro text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Mode"
          value="Guard"
          helper="Tools are logged and blocked according to policy."
        />
        <SummaryCard label="Allowed" value={counts.allow} />
        <SummaryCard label="Blocked" value={counts.block} />
      </div>

      <section className="panel mt-4 flex flex-col">
        <h2 className="text-caption uppercase tracking-wide text-text-muted px-4 py-3 border-b border-border-default">
          Decisions
        </h2>
        <div className="flex flex-col">
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : decisions.length === 0 ? (
            <p className="text-body text-text-muted py-8 text-center">
              Guard events will appear here once crewloop-guard is installed and the agent runs a PreToolUse hook.
            </p>
          ) : (
            decisions.map((decision, i) => <DecisionRow key={`${decision.timestamp}-${i}`} decision={decision} />)
          )}
        </div>
      </section>
    </div>
  );
}
