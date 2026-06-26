import { useState } from 'react';
import type { ToolInvocation } from '../../../../src/lib/invocations';
import { ViewHeader } from '../ViewHeader';
import { FilterBar } from '../FilterBar';
import { Timeline } from '../Timeline';
import { toJson, download, filename, toExportableEvent } from '../../lib/export';
import type { FilterOptions } from '../../lib/types';

interface Props {
  invocations: ToolInvocation[];
  filterOptions: FilterOptions;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function TimelineView({ invocations, filterOptions, onMouseEnter, onMouseLeave }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport() {
    const events = invocations.map(toExportableEvent);
    download(toJson(events), filename('json'));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ViewHeader title="Timeline" icon="Clock" />
      <FilterBar options={filterOptions} resultCount={invocations.length} onExport={handleExport} />
      <Timeline
        invocations={invocations}
        expandedIds={expandedIds}
        onToggle={toggleExpanded}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
}
