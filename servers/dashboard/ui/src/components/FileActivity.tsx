import type { FileEntry } from '../../../src/lib/invocations';
import { FileList } from './FileList';
import { FileDiff } from './FileDiff';

interface Props {
  files: FileEntry[];
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
  sessionId?: string;
  directoryPaths?: Set<string>;
}

export function FileActivity({ files, selectedPath, onSelect, sessionId, directoryPaths }: Props) {
  const selectedFile = files.find((f) => f.path === selectedPath);
  const isDirectory = selectedPath ? directoryPaths?.has(selectedPath) ?? false : false;
  const childCount =
    isDirectory && selectedPath
      ? files.filter((f) => f.path.startsWith(`${selectedPath}/`)).length
      : 0;

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div
        className={`${
          selectedPath ? 'hidden md:flex' : 'flex'
        } w-full md:w-72 flex-shrink-0 border-r border-border-default min-h-0`}
      >
        <FileList files={files} selectedPath={selectedPath} onSelect={onSelect} directoryPaths={directoryPaths} />
      </div>
      <div className={`${selectedPath ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 min-h-0`}>
        <FileDiff
          file={selectedFile}
          sessionId={sessionId}
          onBack={() => onSelect(null)}
          isDirectory={isDirectory}
          childCount={childCount}
        />
      </div>
    </div>
  );
}
