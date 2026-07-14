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
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function handleToggle() {
    if (!open) {
      const idx = sessions.findIndex((s) => s.id === selectedSessionId);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
    setOpen((v) => !v);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, sessions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = sessions[activeIndex];
      if (target) {
        onSelect(target.id);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  }

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
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="chip min-h-[36px] text-label"
      >
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span>{label}</span>
        <Icon name="CaretDown" className="w-4 h-4" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-activedescendant={sessions[activeIndex] ? `session-opt-${activeIndex}` : undefined}
          className="absolute top-[calc(100%+8px)] right-0 min-w-[260px] max-h-[320px] overflow-y-auto bg-surface border border-border-default rounded-lg z-50 shadow-popover p-1.5 animate-fade-in"
        >
          {sessions.map((s, i) => {
            const duration = s.endedAt
              ? `ended after ${formatDuration(s.endedAt - s.startTime)}`
              : formatDuration(Date.now() - s.startTime);
            const isActive = s.id === selectedSessionId;
            const isFocused = i === activeIndex;
            return (
              <li
                key={s.id}
                id={`session-opt-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onSelect(s.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded cursor-pointer text-label border-l-2 ${
                  isActive
                    ? 'bg-elevated border-accent text-text-primary'
                    : isFocused
                    ? 'bg-elevated border-transparent text-text-secondary'
                    : 'border-transparent text-text-secondary hover:bg-elevated'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-mono truncate">{truncate(s.id, 18)}</span>
                  <span className="text-text-muted text-micro">
                    {formatTime(s.startTime)} · {duration}
                  </span>
                </div>
                <span className="ml-auto text-micro text-text-muted uppercase">{s.source}</span>
              </li>
            );
          })}
          {sessions.length === 0 && (
            <li className="px-2.5 py-3 text-label text-text-muted text-center">No sessions yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
