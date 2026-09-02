import { useState, useEffect, useMemo, useRef } from 'react';
import type { FileEntry } from '../../../../src/lib/invocations';
import { FilterBar } from '../FilterBar';
import { FileActivity } from '../FileActivity';
import { computeDirectoryPaths } from '../../lib/dirs';
import type { FilterOptions } from '../../lib/types';
import { useFilters } from '../../contexts/FilterContext';
import { isAbortError } from '../../lib/file-loader';
import { filterWorkspacePaths } from '../../lib/filter';

interface Props {
  files: FileEntry[];
  filterOptions: FilterOptions;
  selectedSessionId: string | null;
  selectedPath: string | null;
  onSelectPath: (path: string | null) => void;
}

export function FilesView({ files, filterOptions, selectedSessionId, selectedPath, onSelectPath }: Props) {
  const [allPaths, setAllPaths] = useState<string[]>([]);
  const [workspaceStatus, setWorkspaceStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const requestGeneration = useRef(0);
  const { filters } = useFilters();

  useEffect(() => {
    setAllPaths([]);
    setWorkspaceStatus('loading');
    setWorkspaceError(null);
    const url = selectedSessionId
      ? `/api/workspace-files?sessionId=${encodeURIComponent(selectedSessionId)}`
      : '/api/workspace-files';
    const controller = new AbortController();
    const generation = ++requestGeneration.current;
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Workspace file response was invalid');
        if (generation === requestGeneration.current) {
          setAllPaths(data);
          setWorkspaceStatus('ready');
        }
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        if (generation === requestGeneration.current) {
          setWorkspaceStatus('error');
          setWorkspaceError(err instanceof Error ? err.message : 'Unable to load workspace files');
        }
      });
    return () => controller.abort();
  }, [selectedSessionId, retryKey]);

  const workspacePaths = filterWorkspacePaths(allPaths, filters);

  const mergedFiles: FileEntry[] = [...files];
  const activePathsSet = new Set(files.map((f) => f.path));

  for (const path of workspacePaths) {
    if (!activePathsSet.has(path)) {
      mergedFiles.push({
        path,
        ops: [],
      });
    }
  }

  mergedFiles.sort((a, b) => a.path.localeCompare(b.path));

  // Paths that are known to contain other paths are directories, even when
  // they appear as leaf entries (the agent read the directory itself).
  const directoryPaths = useMemo(
    () => computeDirectoryPaths(mergedFiles.map((f) => f.path)),
    [workspacePaths, files],
  );

  return (
    <div className="flex-col h-full overflow-hidden flex">
      <header className="flex items-baseline justify-between gap-3 px-4 md:px-5 py-3 border-b border-border-default flex-shrink-0">
        <h1 className="font-display text-display-lg text-text-primary">Files</h1>
        <span className="text-caption text-text-muted" aria-live="polite">{mergedFiles.length} files</span>
      </header>
      <FilterBar options={filterOptions} resultCount={mergedFiles.length} />
      {workspaceStatus === 'loading' && (
        <div role="status" aria-live="polite" className="px-4 py-2 border-b border-border-default text-label text-text-secondary">
          Loading workspace files…
        </div>
      )}
      {workspaceStatus === 'error' && (
        <div role="alert" className="flex items-center gap-3 px-4 py-2 border-b border-error/30 bg-error/5 text-label">
          <span className="text-error flex-1">
            Workspace files unavailable{workspaceError ? `: ${workspaceError}` : ''}. Showing recorded activity.
          </span>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="btn-ghost min-h-11 text-label">
            Retry
          </button>
        </div>
      )}
      <FileActivity
        files={mergedFiles}
        selectedPath={selectedPath}
        onSelect={onSelectPath}
        sessionId={selectedSessionId || undefined}
        directoryPaths={directoryPaths}
      />
    </div>
  );
}
