import { useMemo } from 'react';
import type { ClientSession } from '../../../../src/types';
import { usePinnedSessions } from '../../contexts/PinnedSessionsContext';
import { useFilters } from '../../contexts/FilterContext';
import { useNow } from '../../hooks/useNow';
import { FilterBar } from '../FilterBar';
import { Icon } from '../ui/Icon';
import { sortSessions } from '../../lib/filter';
import { formatDuration, formatTime, truncate } from '../../../../src/lib/format';
import type { FilterOptions, SessionSortKey } from '../../lib/types';

interface Props {
  sessions: ClientSession[];
  selectedSessionId: string | null;
  filterOptions: FilterOptions;
  onSelectSession: (id: string | null) => void;
  sort: SessionSortKey;
  onSortChange: (sort: SessionSortKey) => void;
}

const SORT_OPTIONS: { key: SessionSortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'duration', label: 'Duration' },
  { key: 'events', label: 'Events' },
  { key: 'name', label: 'Name' },
];

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

export function SessionsView({ sessions, selectedSessionId, filterOptions, onSelectSession, sort, onSortChange }: Props) {
  const { pins, togglePin, isPinned } = usePinnedSessions();
  const { filters, resetFilters } = useFilters();
  const now = useNow();
  const sorted = useMemo(() => sortSessions(sessions, sort, pins, now), [sessions, sort, pins, now]);

  const hasActiveFilters =
    filters.query !== '' ||
    filters.sources.length > 0 ||
    filters.skills.length > 0 ||
    filters.statuses.length > 0 ||
    filters.tools.length > 0 ||
    filters.opTypes.length > 0 ||
    filters.timeRange !== 'all';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterBar options={filterOptions} resultCount={sorted.length} />
      <div className="flex items-center gap-2 px-4 md:px-5 py-2 border-b border-border-default flex-shrink-0">
        <Icon name="ArrowsDownUp" className="w-4 h-4 text-text-muted" />
        <span className="text-caption uppercase tracking-wide text-text-muted">Sort</span>
        <div role="group" aria-label="Sort sessions" className="flex items-center ml-1 rounded-lg border border-border-default overflow-hidden">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSortChange(opt.key)}
              aria-pressed={sort === opt.key}
              className={`px-2.5 py-1 text-label transition-colors ${
                sort === opt.key
                  ? 'bg-accent-subtle text-accent-strong'
                  : 'text-text-secondary hover:bg-elevated'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="flex flex-col gap-2">
          {sorted.map((s) => {
            const duration = s.endedAt
              ? formatDuration(s.endedAt - s.startTime)
              : formatDuration(now - s.startTime);
            const active = s.id === selectedSessionId;
            const pinned = isPinned(s.id);
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectSession(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSession(s.id);
                  }
                }}
                className={`group flex items-center gap-3 w-full text-left p-3 rounded-lg border border-l-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-elevated border-border-default border-l-accent'
                    : 'bg-surface border-border-default border-l-transparent hover:bg-elevated'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(s.id);
                  }}
                  aria-label={pinned ? 'Unpin session' : 'Pin session'}
                  className={`p-1 rounded hover:bg-base transition-colors ${
                    pinned ? 'text-warning' : 'text-text-muted group-hover:text-text-secondary'
                  }`}
                >
                  <Icon name="Star" weight={pinned ? 'fill' : 'regular'} className="w-4 h-4" />
                </button>
                <span className={`w-2.5 h-2.5 rounded-full ${lifecycleColor(s.lifecycle)}`} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-body text-text-primary font-mono truncate">
                    {truncate(s.activeSkill?.name || s.id, 40)}
                  </span>
                  <span className="text-micro text-text-muted">
                    {formatTime(s.startTime)} · {duration} · {s.events.length} events
                  </span>
                </div>
                <span className="text-micro uppercase text-text-muted">{s.source}</span>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-text-muted">
              <Icon name="Rows" className="w-12 h-12" />
              {hasActiveFilters ? (
                <>
                  <p className="text-body">Nothing matches these filters.</p>
                  <button onClick={resetFilters} className="btn-ghost text-label">
                    Clear filters
                  </button>
                </>
              ) : (
                <p className="text-body">No sessions yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
