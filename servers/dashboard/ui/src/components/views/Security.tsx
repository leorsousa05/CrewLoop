import { useMemo, useState, useEffect, useCallback } from 'react';
import type { ClientSession } from '../../../../src/types';
import { useSecurity } from '../../hooks/useSecurity';
import { Icon } from '../ui/Icon';
import { formatTime } from '../../../../src/lib/format';
import type { ClientConfirmationRequest } from '../../lib/types';

interface ViewDecision {
  timestamp: number;
  tool: string;
  decision: 'allow' | 'block' | 'pending';
  rule?: string;
  reason?: string;
  confirmationId?: string;
}

function DecisionBadge({ decision }: { decision: 'allow' | 'block' | 'pending' }) {
  const color =
    decision === 'allow'
      ? 'text-success border-success/35'
      : decision === 'block'
      ? 'text-error border-error/35'
      : 'text-warning border-warning/35';
  const dot =
    decision === 'allow' ? 'bg-success' : decision === 'block' ? 'bg-error' : 'bg-warning';
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

function DecisionRow({ decision }: { decision: ViewDecision }) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-2.5 border-b border-border-default last:border-0 hover:bg-elevated transition-colors cursor-default animate-row-in ${
        decision.decision === 'pending' ? 'opacity-75' : ''
      }`}
    >
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
        {decision.decision === 'pending' ? '' : decision.reason || '—'}
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

function formatContext(input?: Record<string, unknown>): string | null {
  if (!input) {
    return null;
  }
  if (typeof input.command === 'string') {
    return input.command;
  }
  if (typeof input.path === 'string') {
    return input.path;
  }
  if (typeof input.file_path === 'string') {
    return input.file_path;
  }
  const text = JSON.stringify(input);
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function PendingCard({
  confirmation,
  onApprove,
  onDeny,
}: {
  confirmation: ClientConfirmationRequest;
  onApprove: (id: string, remember: boolean) => Promise<void>;
  onDeny: (id: string, remember: boolean) => Promise<void>;
}) {
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [remaining, setRemaining] = useState(() => Math.max(0, confirmation.timeoutAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, confirmation.timeoutAt - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [confirmation.timeoutAt]);

  useEffect(() => {
    if (remaining === 0 && !timedOut) {
      setTimedOut(true);
    }
  }, [remaining, timedOut]);

  useEffect(() => {
    if (!timedOut) {
      return;
    }
    const timer = setTimeout(() => setDismissed(true), 10000);
    return () => clearTimeout(timer);
  }, [timedOut]);

  const handleApprove = useCallback(async () => {
    setBusy(true);
    try {
      await onApprove(confirmation.id, remember);
    } finally {
      setBusy(false);
    }
  }, [confirmation.id, remember, onApprove]);

  const handleDeny = useCallback(async () => {
    setBusy(true);
    try {
      await onDeny(confirmation.id, remember);
    } finally {
      setBusy(false);
    }
  }, [confirmation.id, remember, onDeny]);

  if (dismissed) {
    return null;
  }

  const context = formatContext(confirmation.input);
  const isUrgent = remaining <= 30000;

  return (
    <div
      className="panel panel-live relative animate-banner-in mb-4"
      role="status"
      aria-live="polite"
      aria-label="Pending security confirmation"
    >
      <div className="flex items-start gap-3">
        <Icon name="Warning" className="w-5 h-5 text-warning flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-heading font-semibold text-text-primary">
              Action requires confirmation
            </h3>
            <span
              className={`text-caption font-semibold tabular ${
                isUrgent ? 'text-error' : 'text-warning'
              }`}
              aria-label={`Time remaining: ${formatRemaining(remaining)}`}
            >
              {timedOut ? '0:00' : formatRemaining(remaining)}
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-muted">Tool:</span>
              <span className="text-body font-semibold text-text-primary">{confirmation.tool}</span>
            </div>
            {context && (
              <div className="font-mono text-body text-text-secondary truncate" title={context}>
                {context}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-muted">Rule:</span>
              <span className="text-caption text-text-secondary">{confirmation.rule}</span>
            </div>
          </div>

          {timedOut ? (
            <div className="mt-4 text-body font-semibold text-error">Blocked by timeout</div>
          ) : (
            <>
              <label className="mt-4 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-border-strong text-accent focus:ring-accent"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-label text-text-secondary">Remember for this workspace</span>
              </label>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-md bg-success text-white font-semibold text-body hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  <Icon name="Check" className="w-4 h-4" />
                  Allow
                </button>
                <button
                  type="button"
                  onClick={handleDeny}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-md bg-error text-white font-semibold text-body hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  <Icon name="X" className="w-4 h-4" />
                  Deny
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Security({ selectedSession }: Props) {
  const {
    decisions,
    pendingConfirmations,
    loading,
    error,
    approveConfirmation,
    denyConfirmation,
  } = useSecurity(
    selectedSession?.id ?? null,
    selectedSession?.securityDecisions ?? [],
    selectedSession?.pendingConfirmations ?? []
  );

  const viewDecisions = useMemo<ViewDecision[]>(() => {
    const pendingIds = new Set(pendingConfirmations.map((c) => c.id));
    const pending: ViewDecision[] = pendingConfirmations.map((c) => ({
      timestamp: c.timestamp,
      tool: c.tool,
      decision: 'pending',
      rule: c.rule,
      reason: c.reason,
      confirmationId: c.id,
    }));
    // Filter out 'pending' entries from decisions that already appear as
    // confirmation cards to avoid duplicate rows in the log.
    const filtered = decisions.filter((d) => d.decision !== 'pending');
    return [...pending, ...filtered];
  }, [decisions, pendingConfirmations]);

  const counts = useMemo(() => {
    return decisions.reduce(
      (acc, d) => {
        if (d.decision === 'allow') acc.allow++;
        if (d.decision === 'block') acc.block++;
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

      {pendingConfirmations.length > 0 && (
        <section aria-label="Pending confirmations">
          {pendingConfirmations.map((confirmation) => (
            <PendingCard
              key={confirmation.id}
              confirmation={confirmation}
              onApprove={approveConfirmation}
              onDeny={denyConfirmation}
            />
          ))}
        </section>
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
          ) : viewDecisions.length === 0 ? (
            <p className="text-body text-text-muted py-8 text-center">
              Guard events will appear here once crewloop-guard is installed and the agent runs a PreToolUse hook.
            </p>
          ) : (
            viewDecisions.map((decision, i) => (
              <DecisionRow key={`${decision.confirmationId ?? decision.timestamp}-${i}`} decision={decision} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

interface Props {
  selectedSession: ClientSession | undefined;
}
