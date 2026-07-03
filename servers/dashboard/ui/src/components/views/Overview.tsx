import { useMemo } from 'react';
import type { ClientSession } from '../../../../src/types';
import { ActiveSkillPanel } from '../ActiveSkillPanel';
import { TelemetryPanel } from '../TelemetryPanel';
import { ActivityGraph } from '../ActivityGraph';
import { ViewHeader } from '../ViewHeader';
import { usePinnedSessions } from '../../contexts/PinnedSessionsContext';
import { sourceIcon } from '../../../../src/lib/constants';
import { Icon } from '../ui/Icon';
import { truncate } from '../../../../src/lib/format';

interface Props {
  sessions: Map<string, ClientSession>;
  selectedSession: ClientSession | undefined;
  onSelectSession: (id: string) => void;
}

export function Overview({ sessions, selectedSession, onSelectSession }: Props) {
  const { pins } = usePinnedSessions();
  const allSessions = useMemo(() => Array.from(sessions.values()), [sessions]);
  const activeCount = useMemo(
    () => allSessions.filter((s) => s.lifecycle === 'running').length,
    [allSessions]
  );

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of allSessions) {
      const name = s.activeSkill?.name || s.skill;
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [allSessions]);

  const topTools = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of allSessions) {
      for (const e of s.events) {
        if (e.tool) counts.set(e.tool, (counts.get(e.tool) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [allSessions]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ViewHeader title="Overview" icon="House" />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="h-[320px]">
            <ActiveSkillPanel session={selectedSession} />
          </div>
          <div className="h-[320px]">
            <TelemetryPanel session={selectedSession} />
          </div>
          <div className="h-[320px]">
            <ActivityGraph session={selectedSession} />
          </div>

          <section className="panel p-5">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest pb-3 border-b border-border-default">
              Sessions
            </h2>
            <div className="pt-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-display text-4xl text-accent">{allSessions.length}</span>
                <span className="text-[11px] uppercase tracking-widest text-text-muted">Total</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-display text-4xl text-running">{activeCount}</span>
                <span className="text-[11px] uppercase tracking-widest text-text-muted">Active</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-display text-4xl text-accent">{pins.length}</span>
                <span className="text-[11px] uppercase tracking-widest text-text-muted">Pinned</span>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest pb-3 border-b border-border-default">
              Top Skills
            </h2>
            <div className="pt-3 flex flex-col gap-2">
              {topSkills.length === 0 && <p className="text-sm text-text-muted">No skills observed.</p>}
              {topSkills.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary">{name}</span>
                  <span className="text-text-muted tabular">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest pb-3 border-b border-border-default">
              Top Tools
            </h2>
            <div className="pt-3 flex flex-col gap-2">
              {topTools.length === 0 && <p className="text-sm text-text-muted">No tools observed.</p>}
              {topTools.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-text-primary">{name}</span>
                  <span className="text-text-muted tabular">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5 md:col-span-2 xl:col-span-3">
            <h2 className="text-xs font-medium text-text-muted uppercase tracking-widest pb-3 border-b border-border-default">
              Recent Sessions
            </h2>
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSessions.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border-default bg-elevated hover:border-accent transition-colors text-left"
                >
                  <Icon name={sourceIcon(s.source)} className="w-5 h-5 text-text-secondary" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-text-primary font-mono truncate">
                      {truncate(s.activeSkill?.name || 'No active skill', 24)}
                    </span>
                    <span className="text-[11px] text-text-muted uppercase">{s.source}</span>
                  </div>
                </button>
              ))}
              {allSessions.length === 0 && <p className="text-sm text-text-muted">No sessions yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
