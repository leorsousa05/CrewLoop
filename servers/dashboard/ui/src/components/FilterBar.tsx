import { useEffect, useRef, useState } from 'react';
import type { FilterOptions, TimeRange } from '../lib/types';
import { useFilters } from '../contexts/FilterContext';
import { useViewport } from '../hooks/useViewport';
import { Icon } from './ui/Icon';

interface Props {
  options: FilterOptions;
  resultCount: number;
  onExport?: () => void;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '24h', label: '24h' },
  { value: 'session', label: 'This session' },
];

function FilterPopover({
  label,
  activeCount,
  children,
}: {
  label: string;
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [flipLeft, setFlipLeft] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleToggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setFlipLeft(rect.left + 228 > window.innerWidth);
    }
    setOpen((v) => !v);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`chip ${activeCount > 0 ? 'chip-active' : ''}`}
      >
        <span className="text-label">{label}</span>
        {activeCount > 0 && (
          <span className="px-1 rounded bg-accent text-micro font-semibold" style={{ color: 'var(--bg-base)' }}>
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] ${
            flipLeft ? 'right-0' : 'left-0'
          } z-30 min-w-[200px] max-h-64 overflow-y-auto bg-surface border border-border-default rounded-lg shadow-popover p-2 animate-fade-in`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-elevated cursor-pointer text-body text-text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

function RadioRow({
  label,
  checked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-body text-left transition-colors ${
        checked ? 'bg-elevated text-text-primary' : 'text-text-secondary hover:bg-elevated'
      }`}
    >
      <span className="truncate">{label}</span>
      {checked && <Icon name="Check" className="w-4 h-4 text-accent flex-shrink-0" />}
    </button>
  );
}

export function FilterBar({ options, resultCount, onExport }: Props) {
  const { filters, setFilters, resetFilters } = useFilters();
  const { breakpoint } = useViewport();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const activeCount =
    filters.sources.length +
    filters.skills.length +
    filters.statuses.length +
    filters.tools.length +
    filters.opTypes.length +
    (filters.timeRange !== 'all' ? 1 : 0);

  function toggleList<T extends string>(current: T[], value: T): T[] {
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  }

  useEffect(() => {
    if (!sheetOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSheetOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sheetOpen]);

  const popovers = (
    <>
      <FilterPopover label="Source" activeCount={filters.sources.length}>
        {options.sources.map((s) => (
          <CheckboxRow
            key={s}
            label={s}
            checked={filters.sources.includes(s)}
            onChange={() => setFilters({ sources: toggleList(filters.sources, s) })}
          />
        ))}
      </FilterPopover>

      <FilterPopover label="Skill" activeCount={filters.skills.length}>
        {options.skills.map((s) => (
          <CheckboxRow
            key={s}
            label={s}
            checked={filters.skills.includes(s)}
            onChange={() => setFilters({ skills: toggleList(filters.skills, s) })}
          />
        ))}
      </FilterPopover>

      <FilterPopover label="Status" activeCount={filters.statuses.length}>
        {options.statuses.map((s) => (
          <CheckboxRow
            key={s}
            label={s}
            checked={filters.statuses.includes(s)}
            onChange={() => setFilters({ statuses: toggleList(filters.statuses, s) })}
          />
        ))}
      </FilterPopover>

      <FilterPopover label="Tool" activeCount={filters.tools.length}>
        {options.tools.map((t) => (
          <CheckboxRow
            key={t}
            label={t}
            checked={filters.tools.includes(t)}
            onChange={() => setFilters({ tools: toggleList(filters.tools, t) })}
          />
        ))}
      </FilterPopover>

      <FilterPopover label="Op" activeCount={filters.opTypes.length}>
        {options.opTypes.map((o) => (
          <CheckboxRow
            key={o}
            label={o}
            checked={filters.opTypes.includes(o)}
            onChange={() => setFilters({ opTypes: toggleList(filters.opTypes, o) })}
          />
        ))}
      </FilterPopover>

      <FilterPopover label="Time" activeCount={filters.timeRange !== 'all' ? 1 : 0}>
        <div role="radiogroup" aria-label="Time range" className="flex flex-col">
          {TIME_RANGES.map((r) => (
            <RadioRow
              key={r.value}
              label={r.label}
              checked={filters.timeRange === r.value}
              onSelect={() => setFilters({ timeRange: r.value })}
            />
          ))}
        </div>
      </FilterPopover>
    </>
  );

  return (
    <div className="filter-bar flex flex-col gap-2 px-4 md:px-5 py-3 border-b border-border-default flex-shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex items-center flex-1 min-w-[200px]">
          <Icon name="MagnifyingGlass" className="absolute left-2.5 w-4 h-4 text-text-muted" />
          <input
            id="filter-search"
            type="text"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Filter events..."
            className="w-full h-9 pl-9 pr-14 rounded-lg bg-elevated border border-border-default text-body text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
          />
          {filters.query ? (
            <button
              onClick={() => setFilters({ query: '' })}
              aria-label="Clear search"
              className="absolute right-2 text-text-muted hover:text-text-primary"
            >
              <Icon name="XCircle" className="w-4 h-4" />
            </button>
          ) : (
            <span
              className={`kbd absolute right-2.5 transition-opacity ${
                searchFocused ? 'opacity-0' : 'opacity-100'
              }`}
              aria-hidden="true"
            >
              /
            </span>
          )}
        </div>

        {breakpoint === 'mobile' ? (
          <button
            onClick={() => setSheetOpen(true)}
            className={`chip ${activeCount > 0 ? 'chip-active' : ''}`}
            aria-haspopup="dialog"
          >
            <Icon name="Faders" className="w-4 h-4" />
            <span className="text-label">Filters</span>
            {activeCount > 0 && (
              <span className="px-1 rounded bg-accent text-micro font-semibold" style={{ color: 'var(--bg-base)' }}>
                {activeCount}
              </span>
            )}
          </button>
        ) : (
          popovers
        )}

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-label text-text-muted hover:text-text-primary transition-colors"
          >
            Clear all
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            aria-label="Export JSON"
            className="btn-ghost w-9 h-9 justify-center !px-0"
          >
            <Icon name="DownloadSimple" className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="text-micro text-text-muted">
        {resultCount} result{resultCount === 1 ? '' : 's'}
      </div>

      {breakpoint === 'mobile' && sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-40 animate-sheet-scrim-in"
            style={{ backgroundColor: 'var(--overlay)' }}
            onClick={() => setSheetOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto bg-surface border-t border-border-default rounded-t-xl p-3 animate-sheet-in">
            <div className="w-8 h-1 rounded-full bg-border-strong mx-auto mb-3" />
            <div className="flex flex-col gap-1 [&_label]:min-h-[44px] [&_label]:items-center [&_button]:min-h-[44px] [&_.relative]:static [&_.absolute]:static [&_.absolute]:mt-1 [&_.absolute]:max-h-none [&_.absolute]:shadow-none">
              {popovers}
            </div>
            <button
              onClick={() => setSheetOpen(false)}
              className="btn-primary w-full justify-center mt-3"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}
