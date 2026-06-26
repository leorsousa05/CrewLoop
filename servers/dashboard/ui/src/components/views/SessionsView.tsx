import type { ClientSession } from '../../../../src/types';
import { usePinnedSessions } from '../../contexts/PinnedSessionsContext';
import { ViewHeader } from '../ViewHeader';
import { FilterBar } from '../FilterBar';
import { Icon } from '../ui/Icon';
import { formatDuration, formatTime, truncate } from '../../../../src/lib/format';
import type { FilterOptions } from '../../lib/types';

interface Props {
  sessions: ClientSession[];
  selectedSessionId: string | null;
  filterOptions: FilterOptions;
  onSelectSession: (id: string) => void;
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

export function SessionsView({ sessions, selectedSessionId, filterOptions, onSelectSession }: Props) {
  const { togglePin, isPinned } = usePinnedSessions();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ViewHeader title="Sessions" icon="Rows" />
      <FilterBar options={filterOptions} resultCount={sessions.length} />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col gap-2">
          {sessions.map((s) => {
            const duration = s.endedAt
              ? formatDuration(s.endedAt - s.startTime)
              : formatDuration(Date.now() - s.startTime);
            const active = s.id === selectedSessionId;
            const pinned = isPinned(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group flex items-center gap-3 w-full text-left p-3 rounded-lg border transition-colors ${
                  active
                    ? 'bg-elevated border-accent'
                    : 'bg-surface border-border-default hover:bg-elevated'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(s.id);
                  }}
                  aria-label={pinned ? 'Unpin session' : 'Pin session'}
                  className={`p-1 rounded hover:bg-base transition-colors ${
                    pinned ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
                  }`}
                >
                  <Icon name={pinned ? 'PushPinSlash' : 'PushPin'} className="w-4 h-4" />
                </button>
                <span className={`w-2.5 h-2.5 rounded-full ${lifecycleColor(s.lifecycle)}`} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm text-text-primary font-mono truncate">
                    {truncate(s.activeSkill?.name || s.id, 40)}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {formatTime(s.startTime)} · {duration} · {s.events.length} events
                  </span>
                </div>
                <span className="text-[11px] uppercase text-text-muted">{s.source}</span>
              </button>
            );
          })}
          {sessions.length === 0 && <p className="text-sm text-text-muted text-center py-8">No sessions match the filters.</p>}
        </div>
      </div>
    </div>
  );
}
