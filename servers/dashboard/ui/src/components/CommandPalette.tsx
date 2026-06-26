import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CommandPaletteItem } from '../lib/types';
import { search } from '../lib/search';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { useSettings } from '../contexts/SettingsContext';
import { Icon } from './ui/Icon';

interface Props {
  items: CommandPaletteItem[];
  open: boolean;
  onClose: () => void;
}

function groupByType(items: CommandPaletteItem[]) {
  const groups: Record<string, CommandPaletteItem[]> = {};
  for (const item of items) {
    groups[item.type] = groups[item.type] || [];
    groups[item.type].push(item);
  }
  return groups;
}

const GROUP_ORDER = ['view', 'session', 'skill', 'tool', 'file', 'event', 'action'];
const GROUP_LABELS: Record<string, string> = {
  view: 'Views',
  session: 'Sessions',
  skill: 'Skills',
  tool: 'Tools',
  file: 'Files',
  event: 'Recent events',
  action: 'Actions',
};

export function CommandPalette({ items, open, onClose }: Props) {
  const { query, setQuery, selectedIndex, setSelectedIndex } = useCommandPalette();
  const { reducedMotion } = useSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const FOCUSABLE =
    'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])';

  const results = useMemo(() => search(items, query), [items, query]);
  const flatResults = useMemo(() => {
    const groups = groupByType(results);
    const ordered: { item: CommandPaletteItem; group: string }[] = [];
    for (const type of GROUP_ORDER) {
      for (const item of groups[type] || []) ordered.push({ item, group: GROUP_LABELS[type] });
    }
    return ordered;
  }, [results]);

  useEffect(() => {
    if (open) {
      setQuery('');
      inputRef.current?.focus();
    }
  }, [open, setQuery]);

  useEffect(() => {
    if (selectedIndex >= flatResults.length) setSelectedIndex(Math.max(0, flatResults.length - 1));
  }, [flatResults.length, selectedIndex, setSelectedIndex]);

  const activate = useCallback(
    (index: number) => {
      const entry = flatResults[index];
      if (entry) {
        entry.item.action();
        onClose();
      }
    },
    [flatResults, onClose]
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!focusable || focusable.length === 0) return;
        const current = document.activeElement as HTMLElement | null;
        const idx = Array.from(focusable).indexOf(current as HTMLElement);
        if (e.shiftKey) {
          const prev = idx <= 0 ? focusable[focusable.length - 1] : focusable[idx - 1];
          prev.focus();
        } else {
          const next = idx === -1 || idx >= focusable.length - 1 ? focusable[0] : focusable[idx + 1];
          next.focus();
        }
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (flatResults.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % flatResults.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        activate(selectedIndex);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, flatResults.length, selectedIndex, activate, setSelectedIndex, onClose]);

  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]') as HTMLElement | null;
    active?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  let currentGroup = '';

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={`relative w-full max-w-2xl mx-4 bg-surface border border-border-default rounded-xl shadow-2xl overflow-hidden ${
          reducedMotion ? '' : 'animate-modal-in'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default">
          <Icon name="MagnifyingGlass" className="w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search views, sessions, skills, tools, files..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-base border border-border-default text-[10px] text-text-muted font-mono">
            Esc
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {flatResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-text-muted">
              <Icon name="MagnifyingGlass" className="w-8 h-8" />
              <p className="text-sm">No results found.</p>
            </div>
          ) : (
            flatResults.map(({ item, group }, idx) => {
              const showHeader = group !== currentGroup;
              currentGroup = group;
              const active = idx === selectedIndex;
              return (
                <div key={item.id}>
                  {showHeader && (
                    <div className="px-4 py-1.5 text-[11px] uppercase tracking-widest text-text-muted">
                      {group}
                    </div>
                  )}
                  <button
                    data-active={active}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => activate(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      active ? 'bg-elevated' : 'hover:bg-elevated'
                    }`}
                  >
                    <Icon name={item.icon || 'Circle'} className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-text-primary truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-text-muted truncate">{item.subtitle}</span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
