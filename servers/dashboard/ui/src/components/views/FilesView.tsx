import { useState } from 'react';
import type { FileEntry } from '../../../../src/lib/invocations';
import { ViewHeader } from '../ViewHeader';
import { FilterBar } from '../FilterBar';
import { FileActivity } from '../FileActivity';
import type { FilterOptions } from '../../lib/types';

interface Props {
  files: FileEntry[];
  filterOptions: FilterOptions;
}

export function FilesView({ files, filterOptions }: Props) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ViewHeader title="Files" icon="Files" />
      <FilterBar options={filterOptions} resultCount={files.length} />
      <FileActivity files={files} selectedPath={selectedPath} onSelect={setSelectedPath} />
    </div>
  );
}
