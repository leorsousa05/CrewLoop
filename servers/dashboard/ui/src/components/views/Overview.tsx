import { useMemo } from 'react';
import type { ClientSession } from '../../../../src/types';
import type { ToolInvocation } from '../../../../src/lib/invocations';
import { ActiveSkillPanel } from '../ActiveSkillPanel';
import { TelemetryPanel } from '../TelemetryPanel';
import { ActivityGraph } from '../ActivityGraph';
import { sourceIcon } from '../../../../src/lib/constants';
import { Icon } from '../ui/Icon';
import { formatTime, truncate } from '../../../../src/lib/format';

interface Props {
  sessions: Map<string, ClientSession>;
  selectedSession: ClientSession | undefined;
  invocations: ToolInvocation[];
  onSelectSession: (id: string | null) => void;
  onOpenTimeline: () => void;
}

export function Overview({ sessions, selectedSession, invocations, onSelectSession, onOpenTimeline }: Props) {
  const allSessions = useMemo(() => Array.from(sessions.values()), [sessions]);
  const recentSessions = useMemo(
    () => [...allSessions].sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)).slice(0, 8),
    [allSessions]
  );
  const livePreview = useMemo(() => invocations.slice(-5).reverse(), [invocations]);

  if (allSessions.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-center p-6">
        <Icon name="TerminalWindow" className="w-8 h-8 text-text-muted" />
        <h1 className="font-display text-display-lg text-text-primary">No sessions yet</h1>
        <p className="text-body text-text-secondary max-w-sm">
          Start an agent session with CrewLoop installed and events will stream here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4 md:p-6">
        <div className="xl:col-span-3">
          <ActiveSkillPanel session={selectedSession} />
        </div>

        <div className="xl:col-span-3">
          <TelemetryPanel session={selectedSession} />
        </div>

        <div className="xl:col-span-2">
          <ActivityGraph session={selectedSession} />
        </div>

        <section className="panel flex flex-col">
          <h2 className="text-caption uppercase tracking-wide text-text-muted px-5 py-3 border-b border-border-default">
            Live
          </h2>
          <div className="overflow-y-auto px-5 py-2 flex flex-col">
            {livePreview.length === 0 ? (
              <p className="text-body text-text-muted py-4">No tool activity yet.</p>
            ) : (
              livePreview.map((inv, i) => (
                <div key={inv.id} className={`items-baseline gap-2.5 py-1.5 min-w-0 ${i >= 3 ? 'hidden md:flex' : 'flex'}`}>
                  <span className="text-micro text-text-muted tabular flex-shrink-0">{formatTime(inv.startTime)}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${
                      inv.status === 'running'
                        ? 'bg-running'
                        : inv.status === 'error'
                        ? 'bg-error'
                        : 'bg-success'
                    }`}
                  />
                  <span className="font-mono text-label text-text-primary flex-shrink-0">{inv.tool}</span>
                  <span className="text-label text-text-secondary truncate min-w-0">
                    {inv.detail || inv.skill || ''}
                  </span>
                </div>
              ))
            )}
          </div>
          <button
            onClick={onOpenTimeline}
            className="flex items-center gap-1 px-5 py-2.5 border-t border-border-default text-label text-accent hover:bg-elevated transition-colors"
          >
            Open timeline
            <Icon name="CaretRight" className="w-3.5 h-3.5" />
          </button>
        </section>

        <section className="panel xl:col-span-3">
          <h2 className="text-caption uppercase tracking-wide text-text-muted px-5 py-3 border-b border-border-default">
            Recent Sessions
          </h2>
          <div className="p-3 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {recentSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`snap-start w-48 flex-shrink-0 flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  s.id === selectedSession?.id
                    ? 'border-accent bg-accent-subtle'
                    : 'border-border-default bg-elevated hover:border-border-strong'
                }`}
              >
                <Icon name={sourceIcon(s.source)} className="w-5 h-5 text-text-secondary flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-body text-text-primary font-mono truncate">
                    {truncate(s.activeSkill?.name || 'No active skill', 24)}
                  </span>
                  <span className="text-micro text-text-muted uppercase">{s.source}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
