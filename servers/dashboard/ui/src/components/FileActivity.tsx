import type { FileEntry } from '../../../src/lib/invocations';
import { FileList } from './FileList';
import { FileDiff } from './FileDiff';

interface Props {
  files: FileEntry[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function FileActivity({ files, selectedPath, onSelect }: Props) {
  const selectedFile = files.find((f) => f.path === selectedPath);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <FileList files={files} selectedPath={selectedPath} onSelect={onSelect} />
      <FileDiff file={selectedFile} />
    </div>
  );
}
