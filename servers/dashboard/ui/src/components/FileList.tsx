import type { FileEntry } from '../../../src/lib/invocations';
import { truncate } from '../../../src/lib/format';
import { Icon } from './ui/Icon';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  files: FileEntry[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function FileList({ files, selectedPath, onSelect }: Props) {
  if (files.length === 0) {
    return (
      <div className="w-full md:w-72 flex-shrink-0 flex items-center justify-center text-text-muted text-sm border-r border-border-default">
        No file activity matches the filters.
      </div>
    );
  }

  return (
    <div className="w-full md:w-72 flex-shrink-0 overflow-y-auto border-r border-border-default p-2">
      {files.map((file) => {
        const latest = file.ops[file.ops.length - 1];
        const isActive = file.path === selectedPath;
        return (
          <button
            key={file.path}
            onClick={() => onSelect(file.path)}
            className={`file-list-item w-full flex flex-col gap-1.5 text-left p-2.5 rounded border transition-colors ${
              isActive
                ? 'bg-elevated border-accent'
                : 'border-transparent hover:bg-elevated'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 text-text-primary font-mono text-[13px]">
              <Icon name="FileText" className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="truncate" title={file.path}>
                {truncate(file.path, 32)}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap items-center">
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
          </button>
        );
      })}
    </div>
  );
}
