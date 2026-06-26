import { escapeHtml } from '../../../src/lib/format';
import type { FileEntry } from '../../../src/lib/invocations';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  file: FileEntry | undefined;
}

export function FileDiff({ file }: Props) {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Select a file to view activity.
      </div>
    );
  }

  const latest = file.ops[file.ops.length - 1];
  const lines = file.snippet ? String(file.snippet).split('\n').slice(0, 80) : [];

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <header className="flex flex-col gap-2 p-4 pb-3 border-b border-border-default">
        <span className="text-text-primary break-all text-sm font-mono">{file.path}</span>
        <div className="flex gap-2 flex-wrap">
          {file.ops.map((op) => (
            <span
              key={op.id}
              className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                op.type === 'read'
                  ? 'text-running border-running/35'
                  : op.type === 'edit'
                  ? 'text-success border-success/35'
                  : 'text-text-muted border-border-default'
              }`}
            >
              {op.type}
            </span>
          ))}
          <StatusBadge status={latest.status} />
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4 font-mono text-[13px]">
        {lines.length === 0 ? (
          <p className="text-text-muted">No diff or content snippet available.</p>
        ) : (
          <div className="min-w-full inline-block">
            {lines.map((line, i) => {
              let cls = 'text-text-secondary px-1 whitespace-pre';
              if (line.startsWith('+')) cls = 'text-success bg-success/5 px-1 whitespace-pre';
              else if (line.startsWith('-')) cls = 'text-error bg-error/5 px-1 whitespace-pre';
              else if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++'))
                cls = 'text-text-muted px-1 whitespace-pre';
              return (
                <div key={i} className={cls}>
                  <span dangerouslySetInnerHTML={{ __html: escapeHtml(line) }} />
                </div>
              );
            })}
            {String(file.snippet).split('\n').length > 80 && (
              <p className="text-text-muted mt-2 text-xs">Content truncated.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
