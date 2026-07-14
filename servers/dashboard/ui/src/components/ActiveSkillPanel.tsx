import type { ClientSession } from '../../../src/types';
import { skillIcon, sourceIcon } from '../../../src/lib/constants';
import { formatDuration } from '../../../src/lib/format';
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
      <section className="panel px-5 py-3 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-elevated border border-border-default flex items-center justify-center text-text-muted flex-shrink-0">
          <Icon name="MonitorPlay" className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-display text-display-lg text-text-muted">Idle</span>
          <span className="text-body text-text-secondary">No active skill — waiting for events</span>
        </div>
      </section>
    );
  }

  const hasSkill = session.activeSkill !== undefined;
  const skill = session.activeSkill || { name: 'No skill', confidence: 'unknown' };
  const lifecycle = session.lifecycle || 'starting';
  const endedStatus = session.lifecycle === 'ended' ? session.status || 'ENDED' : undefined;
  const isLive = session.lifecycle === 'running';
  const elapsed = formatDuration((session.endedAt || session.lastActivity || Date.now()) - session.startTime);

  return (
    <section className={`panel px-5 py-3 flex items-center gap-4 ${isLive ? 'panel-live' : ''}`}>
      <div className={`w-10 h-10 rounded-lg border border-border-default flex items-center justify-center flex-shrink-0 ${hasSkill ? 'bg-elevated text-accent' : 'bg-warning/10 text-warning'}`}>
        <Icon name={skillIcon(skill.name)} className="w-5 h-5" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <h2 className="font-display text-display-lg text-text-primary truncate">{skill.name}</h2>
        <span className="text-body text-text-secondary truncate">
          {hasSkill ? `${session.source} session` : 'Agent is running without an active role'}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="chip uppercase">
          <span className={`w-2 h-2 rounded-full ${lifecycleColor(lifecycle)}`} />
          {endedStatus || lifecycle}
        </span>
        <span className="text-micro text-text-muted uppercase hidden sm:inline">{skill.confidence}</span>
        <Icon name={sourceIcon(session.source)} className="w-4 h-4 text-text-muted hidden sm:block" />
        <span className="text-micro text-text-muted tabular">{elapsed}</span>
      </div>
    </section>
  );
}
