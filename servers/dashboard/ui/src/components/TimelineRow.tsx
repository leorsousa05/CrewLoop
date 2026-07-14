import { useMemo, useState } from 'react';
import type { ToolInvocation } from '../../../src/lib/invocations';
import { formatDuration, formatTime, escapeHtml, prettyJson } from '../../../src/lib/format';
import { Icon } from './ui/Icon';

interface Props {
  inv: ToolInvocation;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onCopy: () => void;
}

function statusClasses(status: string): { row: string; dot: string; icon: string } {
  switch (status) {
    case 'running':
      return {
        row: 'bg-running/10 border-l-running',
        dot: 'bg-running animate-pulse',
        icon: 'Spinner',
      };
    case 'success':
      return {
        row: 'bg-success/5 border-l-success',
        dot: 'bg-success',
        icon: 'Check',
      };
    case 'error':
      return {
        row: 'bg-error/5 border-l-error',
        dot: 'bg-error',
        icon: 'X',
      };
    default:
      return {
        row: 'border-l-transparent opacity-90',
        dot: 'bg-text-muted',
        icon: '',
      };
  }
}

function Payload({ label, payload }: { label: string; payload?: Record<string, unknown> }) {
  if (!payload || Object.keys(payload).length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="label">{label}</span>
      <pre className="p-2.5 bg-base border border-border-default rounded text-label text-text-secondary whitespace-pre-wrap break-words max-h-52 overflow-auto">
        <code dangerouslySetInnerHTML={{ __html: escapeHtml(prettyJson(payload)) }} />
      </pre>
    </div>
  );
}

export function TimelineRow({ inv, expanded, selected, onToggle, onSelect, onCopy }: Props) {
  const status = statusClasses(inv.status);
  const [copied, setCopied] = useState(false);
  const hasDetails = useMemo(
    () => (inv.input && Object.keys(inv.input).length > 0) || (inv.output && Object.keys(inv.output).length > 0),
    [inv.input, inv.output]
  );

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <li role="listitem">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => {
          onSelect();
          onToggle();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
            onToggle();
          }
        }}
        className={`timeline-row group grid grid-cols-[80px_16px_1fr_auto] items-start gap-3 py-2 px-2.5 -mx-2.5 rounded cursor-pointer border-l-2 hover:bg-elevated transition-colors animate-row-in ${
          selected ? 'bg-accent-subtle border-l-accent' : status.row
        }`}
      >
        <span className="text-micro text-text-muted text-right pt-0.5 tabular">{formatTime(inv.startTime)}</span>
        <span aria-hidden="true" className={`w-2 h-2 rounded-full justify-self-center mt-1.5 z-10 ${status.dot}`} />
        <span className="sr-only">{inv.status}</span>
        <div className="flex items-baseline gap-2.5 min-w-0 flex-wrap">
          <span className="font-mono text-body font-semibold text-text-primary flex-shrink-0">{inv.tool}</span>
          <span className="text-body text-text-secondary truncate min-w-0">
            {inv.detail || inv.skill || ''}
          </span>
          {inv.durationMs ? (
            <span className="text-micro text-text-muted bg-inset px-1.5 py-0.5 rounded ml-auto tabular">
              {formatDuration(inv.durationMs)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1 text-text-muted mt-0.5">
          {status.icon ? <Icon name={status.icon} className={`w-4 h-4 ${status.icon === 'Spinner' ? 'animate-spin' : ''}`} /> : null}
          <button
            onClick={handleCopy}
            aria-label="Copy event"
            className="p-1 rounded hover:bg-base hover:text-accent transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <Icon name={copied ? 'Check' : 'Copy'} className="w-3.5 h-3.5" />
          </button>
          <Icon name={expanded ? 'CaretDown' : 'CaretRight'} className="w-3 h-3 flex-shrink-0" />
        </div>
        {expanded && (
          <div className="col-span-3 col-start-2 mt-2 p-3 bg-inset border border-border-default rounded flex flex-col gap-3">
            {hasDetails ? (
              <>
                <Payload label="Input" payload={inv.input} />
                <Payload label="Output" payload={inv.output} />
              </>
            ) : (
              <p className="text-body text-text-muted">No details available.</p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
