import type { ClientSession } from '../../../src/types';
import { skillIcon, sourceIcon } from '../../../src/lib/constants';
import { Icon } from './ui/Icon';

interface Props {
  session: ClientSession | undefined;
}

function lifecycleColor(lifecycle: string): string {
  switch (lifecycle) {
    case 'starting':
      return 'bg-warning';
    case 'running':
      return 'bg-running';
    case 'ended':
      return 'bg-text-muted';
    default:
      return 'bg-text-muted';
  }
}

export function ActiveSkillPanel({ session }: Props) {
  if (!session) {
    return (
      <section className="panel p-6 flex flex-col items-center justify-center gap-3 text-center h-full">
        <div className="w-16 h-16 rounded-xl bg-elevated border border-border-default flex items-center justify-center text-text-muted">
          <Icon name="MonitorPlay" className="w-8 h-8" />
        </div>
        <h2 className="font-display text-4xl tracking-wide text-text-primary">NO ACTIVE SESSION</h2>
        <p className="text-sm text-text-secondary">Start an agent session to see it here.</p>
      </section>
    );
  }

  const hasSkill = session.activeSkill !== undefined;
  const skill = session.activeSkill || { name: 'NO SKILL', confidence: 'unknown' };
  const lifecycle = session.lifecycle || 'starting';
  const endedStatus = session.lifecycle === 'ended' ? session.status || 'ENDED' : undefined;

  return (
    <section className="panel p-6 h-full">
      <div className={`absolute top-0 left-0 right-0 h-1 ${lifecycleColor(lifecycle)}`} />
      <div className="flex flex-col gap-4">
        <div className={`w-16 h-16 rounded-xl border border-border-default flex items-center justify-center ${hasSkill ? 'bg-elevated text-accent' : 'bg-warning/10 text-warning'}`}>
          <Icon name={skillIcon(skill.name)} className="w-8 h-8" />
        </div>
        <h1 className="font-display text-6xl leading-none tracking-wide text-text-primary uppercase">
          {skill.name}
        </h1>
        {!hasSkill && (
          <p className="text-sm text-text-secondary">Agent is running without an active role.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border-default bg-elevated text-text-secondary uppercase">
            <span className={`w-2 h-2 rounded-full ${lifecycleColor(lifecycle)}`} />
            {endedStatus || lifecycle}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-border-default bg-elevated text-text-secondary uppercase">
            {skill.confidence}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-widest">
          <Icon name={sourceIcon(session.source)} className="w-4 h-4" />
          <span>{session.source}</span>
        </div>
      </div>
    </section>
  );
}
