import { useEffect, useRef, useState } from 'react';
import type { FilterOptions, TimeRange } from '../lib/types';
import { useFilters } from '../contexts/FilterContext';
import { Icon } from './ui/Icon';

interface Props {
  options: FilterOptions;
  resultCount: number;
  onExport?: () => void;
}

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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
          activeCount > 0
            ? 'border-accent text-accent bg-accent/10'
            : 'border-border-default text-text-secondary hover:border-strong'
        }`}
      >
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="px-1 rounded bg-accent text-white text-[10px]">{activeCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-30 min-w-[180px] max-h-64 overflow-y-auto bg-surface border border-border-default rounded-lg shadow-lg p-2">
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
    <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-elevated cursor-pointer text-sm text-text-secondary">
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

export function FilterBar({ options, resultCount, onExport }: Props) {
  const { filters, setFilters, resetFilters } = useFilters();
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

  return (
    <div className="filter-bar flex flex-col gap-2 px-5 py-3 border-b border-border-default flex-shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex items-center flex-1 min-w-[200px]">
          <Icon name="MagnifyingGlass" className="absolute left-2.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            placeholder="Filter events..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-elevated border border-border-default text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
          />
          {filters.query && (
            <button
              onClick={() => setFilters({ query: '' })}
              aria-label="Clear search"
              className="absolute right-2 text-text-muted hover:text-text-primary"
            >
              <Icon name="XCircle" className="w-4 h-4" />
            </button>
          )}
        </div>

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
          {(['all', '1m', '5m', '15m', '1h', '24h', 'session'] as TimeRange[]).map((r) => (
            <CheckboxRow
              key={r}
              label={r === 'all' ? 'All time' : r === 'session' ? 'This session' : r}
              checked={filters.timeRange === r}
              onChange={() => setFilters({ timeRange: r })}
            />
          ))}
        </FilterPopover>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Clear all
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            aria-label="Export JSON"
            className="w-9 h-9 rounded-lg border border-border-default bg-elevated text-text-secondary hover:border-accent hover:text-accent transition-colors flex items-center justify-center"
          >
            <Icon name="DownloadSimple" className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="text-xs text-text-muted">
        {resultCount} result{resultCount === 1 ? '' : 's'}
      </div>
    </div>
  );
}
