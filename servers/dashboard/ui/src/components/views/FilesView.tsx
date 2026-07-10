import { useState, useEffect } from 'react';
import type { FileEntry } from '../../../../src/lib/invocations';
import { ViewHeader } from '../ViewHeader';
import { FilterBar } from '../FilterBar';
import { FileActivity } from '../FileActivity';
import type { FilterOptions } from '../../lib/types';

interface Props {
  files: FileEntry[];
  filterOptions: FilterOptions;
  selectedSessionId: string | null;
}

export function FilesView({ files, filterOptions, selectedSessionId }: Props) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
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

  return (
    <div className="flex-col h-full overflow-hidden flex">
      <ViewHeader title="Files" icon="Files" />
      <FilterBar options={filterOptions} resultCount={mergedFiles.length} />
      <FileActivity
        files={mergedFiles}
        selectedPath={selectedPath}
        onSelect={setSelectedPath}
        sessionId={selectedSessionId || undefined}
      />
    </div>
  );
}
