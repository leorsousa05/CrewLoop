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
  const requestGeneration = useRef(0);
  const { filters } = useFilters();

  useEffect(() => {
    setAllPaths([]);
    const url = selectedSessionId
      ? `/api/workspace-files?sessionId=${encodeURIComponent(selectedSessionId)}`
      : '/api/workspace-files';
    const controller = new AbortController();
    const generation = ++requestGeneration.current;
    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (generation === requestGeneration.current && Array.isArray(data)) {
          setAllPaths(data);
        }
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        console.error('Failed to load workspace files', err);
      });
    return () => controller.abort();
  }, [selectedSessionId]);

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
      <FilterBar options={filterOptions} resultCount={mergedFiles.length} />
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
