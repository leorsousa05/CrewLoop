import { useEffect, useRef, useState } from 'react';
import type { ClientSession } from '../../../src/types';
import { Icon } from './ui/Icon';
import { formatDuration, formatTime, truncate } from '../../../src/lib/format';

interface Props {
  sessions: ClientSession[];
  selectedSessionId: string | null;
  activeSessionId: string | undefined;
  connection: 'connecting' | 'connected' | 'disconnected';
  onSelect: (id: string) => void;
}

export function SessionSelector({
  sessions,
  selectedSessionId,
  activeSessionId,
  connection,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const current = sessions.find((s) => s.id === selectedSessionId);
  const dotColor =
    connection === 'connected'
      ? 'bg-success'
      : connection === 'connecting'
      ? 'bg-warning'
      : 'bg-error';

  const label = current
    ? (current.id === activeSessionId ? '● ' : '') + (current.skill?.toUpperCase() || truncate(current.id, 12))
    : 'No session';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-default bg-elevated text-text-secondary text-xs hover:border-accent transition-colors min-h-[36px]"
      >
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span>{label}</span>
        <Icon name="CaretDown" className="w-4 h-4" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+8px)] right-0 min-w-[260px] max-h-[320px] overflow-y-auto bg-surface border border-border-default rounded z-50 shadow-lg p-1.5"
        >
          {sessions.map((s) => {
            const duration = s.endedAt
              ? `ended after ${formatDuration(s.endedAt - s.startTime)}`
              : formatDuration(Date.now() - s.startTime);
            const isActive = s.id === selectedSessionId;
            return (
              <li
                key={s.id}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(s.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded cursor-pointer text-xs border-l-2 ${
                  isActive
                    ? 'bg-elevated border-accent text-text-primary'
                    : 'border-transparent text-text-secondary hover:bg-elevated'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-mono truncate">{truncate(s.id, 18)}</span>
                  <span className="text-text-muted text-[11px]">
                    {formatTime(s.startTime)} · {duration}
                  </span>
                </div>
                <span className="ml-auto text-text-muted uppercase">{s.source}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
