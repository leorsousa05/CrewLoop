import { useState, useEffect } from 'react';
import type { FileEntry } from '../../../src/lib/invocations';
import { truncate } from '../../../src/lib/format';
import { Icon } from './ui/Icon';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  files: FileEntry[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: FileTreeNode[];
  fileEntry?: FileEntry;
}

export function buildFileTree(files: FileEntry[]): FileTreeNode[] {
  const rootNodes: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let currentLevel = rootNodes;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let existingNode = currentLevel.find((node) => node.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'directory',
          children: [],
          fileEntry: isLast ? file : undefined,
        };
        currentLevel.push(existingNode);
      }

      currentLevel = existingNode.children;
    }
  }

  const sortNodes = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(rootNodes);
  return rootNodes;
}

export function FileList({ files, selectedPath, onSelect }: Props) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initialExpanded = new Set<string>();
    for (const file of files) {
      if (file.ops.length > 0) {
        const parts = file.path.split('/');
        // Expand todos os diretórios pais
        for (let i = 1; i < parts.length; i++) {
          const parentPath = parts.slice(0, i).join('/');
          initialExpanded.add(parentPath);
        }
      }
    }
    setExpandedPaths(initialExpanded);
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="w-full md:w-72 flex-shrink-0 flex items-center justify-center text-text-muted text-sm border-r border-border-default">
        No file activity matches the filters.
      </div>
    );
  }

  const isAbsolutePath = (p: string) => p.startsWith('/') || /^[a-zA-Z]:/.test(p);
  const workspaceFiles = files.filter((f) => !isAbsolutePath(f.path));
  const externalFiles = files.filter((f) => isAbsolutePath(f.path));

  const tree = buildFileTree(workspaceFiles);

  const toggleExpand = (path: string) => {
    const next = new Set(expandedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setExpandedPaths(next);
  };

  const renderExternalNode = (file: FileEntry) => {
    const isActive = file.path === selectedPath;
    const hasOps = file.ops.length > 0;
    const latest = file.ops[file.ops.length - 1];

    return (
      <button
        key={file.path}
        onClick={() => onSelect(file.path)}
        className={`file-list-item w-full flex flex-col gap-1 text-left py-1.5 px-2 rounded border transition-all duration-150 ${
          isActive
            ? 'bg-elevated border-accent font-semibold shadow-sm ring-1 ring-accent/25 text-text-primary'
            : hasOps
            ? 'border-transparent text-text-secondary hover:border-accent/20 hover:text-text-primary hover:bg-elevated/40'
            : 'border-transparent text-text-muted/70 hover:text-text-secondary hover:bg-elevated/20'
        }`}
      >
        <div className={`flex items-center gap-1.5 min-w-0 font-mono text-[12px] ${
          isActive ? 'text-text-primary' : hasOps ? 'text-text-secondary' : 'text-text-muted'
        }`}>
          <Icon name="FileText" className={`w-3.5 h-3.5 flex-shrink-0 ${
            isActive ? 'text-accent' : hasOps ? 'text-accent/60' : 'text-text-muted/40'
          }`} />
          <span className="truncate" title={file.path}>
            {truncate(file.path, 32)}
          </span>
        </div>
        {hasOps && (
          <div className="flex gap-1 flex-wrap items-center pl-5 scale-90">
            {file.ops.slice(0, 3).map((op) => (
              <span
                key={op.id}
                className={`text-[8px] font-semibold uppercase px-1 py-0.2 rounded border ${
                  op.type === 'read'
                    ? 'text-running border-running/30 bg-running/5'
                    : op.type === 'edit'
                    ? 'text-success border-success/30 bg-success/5'
                    : 'text-text-muted border-border-default'
                }`}
              >
                {op.type}
              </span>
            ))}
            {latest && <StatusBadge status={latest.status} />}
          </div>
        )}
      </button>
    );
  };

  const renderNode = (node: FileTreeNode, depth: number) => {
    const isDirectory = node.type === 'directory';
    const isExpanded = expandedPaths.has(node.path);
    const indentStyle = { paddingLeft: `${depth * 12 + 8}px` };

    if (isDirectory) {
      return (
        <div key={node.path} className="flex flex-col">
          <button
            onClick={() => toggleExpand(node.path)}
            style={indentStyle}
            className="w-full flex items-center gap-1.5 py-1.5 text-left text-text-secondary hover:text-text-primary hover:bg-elevated/20 transition-all font-mono text-[12px] rounded border border-transparent"
          >
            <span className="w-3 text-center text-[10px] text-text-muted select-none">
              {isExpanded ? '▼' : '▶'}
            </span>
            <Icon
              name={isExpanded ? 'FolderOpen' : 'Folder'}
              className="w-4 h-4 text-accent/70 flex-shrink-0"
            />
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    const file = node.fileEntry!;
    const isActive = file.path === selectedPath;
    const hasOps = file.ops.length > 0;
    const latest = file.ops[file.ops.length - 1];

    return (
      <button
        key={file.path}
        onClick={() => onSelect(file.path)}
        style={indentStyle}
        className={`file-list-item w-full flex flex-col gap-1 text-left py-1.5 pr-2 rounded border transition-all duration-150 ${
          isActive
            ? 'bg-elevated border-accent font-semibold shadow-sm ring-1 ring-accent/25 text-text-primary'
            : hasOps
            ? 'border-transparent text-text-secondary hover:border-accent/20 hover:text-text-primary hover:bg-elevated/40'
            : 'border-transparent text-text-muted/70 hover:text-text-secondary hover:bg-elevated/20'
        }`}
      >
        <div className={`flex items-center gap-1.5 min-w-0 font-mono text-[12.5px] ${
          isActive ? 'text-text-primary' : hasOps ? 'text-text-secondary' : 'text-text-muted'
        }`}>
          <Icon name="FileText" className={`w-3.5 h-3.5 flex-shrink-0 ${
            isActive ? 'text-accent' : hasOps ? 'text-accent/60' : 'text-text-muted/40'
          }`} />
          <span className="truncate" title={file.path}>
            {node.name}
          </span>
        </div>
        {hasOps && (
          <div className="flex gap-1 flex-wrap items-center pl-5">
            {file.ops.slice(0, 3).map((op) => (
              <span
                key={op.id}
                className={`text-[8.5px] font-semibold uppercase px-1 py-0.2 rounded border ${
                  op.type === 'read'
                    ? 'text-running border-running/30 bg-running/5'
                    : op.type === 'edit'
                    ? 'text-success border-success/30 bg-success/5'
                    : 'text-text-muted border-border-default'
                }`}
              >
                {op.type}
              </span>
            ))}
            {latest && <StatusBadge status={latest.status} />}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="w-full md:w-72 flex-shrink-0 overflow-y-auto border-r border-border-default p-2 flex flex-col gap-0.5">
      {tree.map((node) => renderNode(node, 0))}

      {externalFiles.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-default/45 flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold px-2.5 mb-1.5 select-none">
            Arquivos Externos
          </div>
          {externalFiles.map(renderExternalNode)}
        </div>
      )}
    </div>
  );
}
