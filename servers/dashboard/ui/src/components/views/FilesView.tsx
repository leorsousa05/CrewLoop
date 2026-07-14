import { useState, useEffect, useMemo } from 'react';
import type { FileEntry } from '../../../../src/lib/invocations';
import { FilterBar } from '../FilterBar';
import { FileActivity } from '../FileActivity';
import { computeDirectoryPaths } from '../../lib/dirs';
import type { FilterOptions } from '../../lib/types';

interface Props {
  files: FileEntry[];
  filterOptions: FilterOptions;
  selectedSessionId: string | null;
  selectedPath: string | null;
  onSelectPath: (path: string | null) => void;
}

export function FilesView({ files, filterOptions, selectedSessionId, selectedPath, onSelectPath }: Props) {
  const [allPaths, setAllPaths] = useState<string[]>([]);

  useEffect(() => {
    const url = selectedSessionId
      ? `/api/workspace-files?sessionId=${encodeURIComponent(selectedSessionId)}`
      : '/api/workspace-files';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllPaths(data);
        }
      })
      .catch((err) => console.error('Failed to load workspace files', err));
  }, [selectedSessionId]);

  const mergedFiles: FileEntry[] = [...files];
  const activePathsSet = new Set(files.map((f) => f.path));

  for (const path of allPaths) {
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
    [allPaths, files],
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
