import { useCallback, useEffect, useState } from 'react';
import type { ToolInvocation } from '../../../../src/lib/invocations';
import { FilterBar } from '../FilterBar';
import { Timeline } from '../Timeline';
import { PauseBanner } from '../PauseBanner';
import { Icon } from '../ui/Icon';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { toJson, download, filename, toExportableEvent } from '../../lib/export';
import type { FilterOptions } from '../../lib/types';

interface Props {
  invocations: ToolInvocation[];
  filterOptions: FilterOptions;
  paused: boolean;
  manualPaused: boolean;
  bufferedCount: number;
  onHoverChange: (hovering: boolean) => void;
  onManualPauseToggle: () => void;
  onResume: () => void;
}

export function TimelineView({
  invocations,
  filterOptions,
  paused,
  manualPaused,
  bufferedCount,
  onHoverChange,
  onManualPauseToggle,
  onResume,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useKeyboardShortcut('p', onManualPauseToggle);

  // j/k move the selection; Enter expands or collapses the selected row.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'j' || e.key === 'k') {
        if (invocations.length === 0) return;
        e.preventDefault();
        const idx = selectedId ? invocations.findIndex((i) => i.id === selectedId) : -1;
        const next =
          e.key === 'j'
            ? idx < 0 ? 0 : Math.min(idx + 1, invocations.length - 1)
            : idx < 0 ? 0 : Math.max(idx - 1, 0);
        setSelectedId(invocations[next].id);
      } else if (e.key === 'Enter' && selectedId) {
        e.preventDefault();
        toggleExpanded(selectedId);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [invocations, selectedId, toggleExpanded]);

  function handleExport() {
    const events = invocations.map(toExportableEvent);
    download(toJson(events), filename('json'));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-stretch border-b border-border-default flex-shrink-0">
        <div className="flex-1 min-w-0 [&_.filter-bar]:border-b-0">
          <FilterBar options={filterOptions} resultCount={invocations.length} onExport={handleExport} />
        </div>
        <div className="flex items-center px-3 border-l border-border-default">
          <button
            onClick={onManualPauseToggle}
            aria-pressed={manualPaused}
            aria-label={manualPaused ? 'Resume live updates' : 'Pause live updates'}
            title="Pause (p)"
            className={`btn-ghost w-9 h-9 justify-center !px-0 ${manualPaused ? 'text-accent' : ''}`}
          >
            <Icon name={manualPaused ? 'Play' : 'Pause'} className="w-4 h-4" />
          </button>
        </div>
      </div>
      {paused && (
        <PauseBanner bufferedCount={bufferedCount} manual={manualPaused} onResume={onResume} />
      )}
      <Timeline
        invocations={invocations}
        expandedIds={expandedIds}
        onToggle={toggleExpanded}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
      />
    </div>
  );
}
