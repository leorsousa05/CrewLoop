import type { ToolInvocation } from '../../../src/lib/invocations';
import { TimelineRow } from './TimelineRow';

interface Props {
  invocations: ToolInvocation[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function Timeline({ invocations, expandedIds, onToggle, onMouseEnter, onMouseLeave }: Props) {
  async function handleCopy(inv: ToolInvocation) {
    const text = JSON.stringify(
      {
        id: inv.id,
        tool: inv.tool,
        status: inv.status,
        startTime: inv.startTime,
        durationMs: inv.durationMs,
        skill: inv.skill,
        detail: inv.detail,
      },
      null,
      2
    );
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard errors.
    }
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-5 py-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {invocations.length === 0 ? (
        <p className="text-center py-8 text-text-muted text-sm">No events match the filters.</p>
      ) : (
        <ul className="relative list-none m-0 p-0 before:content-[''] before:absolute before:top-3 before:bottom-3 before:left-[32px] before:w-px before:bg-border-default">
          {invocations.map((inv) => (
            <TimelineRow
              key={inv.id}
              inv={inv}
              expanded={expandedIds.has(inv.id)}
              onToggle={() => onToggle(inv.id)}
              onCopy={() => handleCopy(inv)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
