import fs from 'node:fs';
import path from 'node:path';

export type WorkspaceAccessErrorCode =
  | 'PATH_FORBIDDEN'
  | 'FILE_NOT_FOUND'
  | 'FILE_TOO_LARGE'
  | 'BINARY_FILE_UNSUPPORTED'
  | 'WORKSPACE_LIMIT_EXCEEDED';

export class WorkspaceAccessError extends Error {
  readonly code: WorkspaceAccessErrorCode;

  constructor(code: WorkspaceAccessErrorCode, message: string) {
    super(message);
    this.name = 'WorkspaceAccessError';
    this.code = code;
  }
}

export interface WorkspaceLimits {
  fileBytes: number;
  workspaceEntries: number;
  workspaceDepth: number;
}

const IGNORED_ENTRIES = new Set([
  '.git',
  'node_modules',
  'dist',
  '.next',
  'build',
  'coverage',
  '.gemini',
  'out',
  '.system_generated',
  '.DS_Store',
]);

async function realpathSafe(target: string): Promise<string | undefined> {
  try {
    return await fs.promises.realpath(target);
  } catch {
    return undefined;
  }
}

function isContained(root: string, candidate: string): boolean {
  if (candidate === root) return true;
  const relative = path.relative(root, candidate);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export async function resolveContainedPath(root: string, relativePath: string): Promise<string> {
  if (path.isAbsolute(relativePath)) {
    throw new WorkspaceAccessError('PATH_FORBIDDEN', 'Absolute paths are not allowed');
  }

  const realRoot = await realpathSafe(root);
  if (!realRoot) {
    throw new WorkspaceAccessError('FILE_NOT_FOUND', 'Workspace root not found');
  }

  const resolved = path.resolve(realRoot, relativePath);
  if (!isContained(realRoot, resolved)) {
    throw new WorkspaceAccessError('PATH_FORBIDDEN', 'Path escapes the workspace root');
  }

  const realTarget = await realpathSafe(resolved);
  if (!realTarget) {
    throw new WorkspaceAccessError('FILE_NOT_FOUND', 'File not found');
  }
  if (!isContained(realRoot, realTarget)) {
    throw new WorkspaceAccessError('PATH_FORBIDDEN', 'Symlink target escapes the workspace root');
  }
  return realTarget;
}

export async function readTextFile(absPath: string, maxBytes: number): Promise<string> {
  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(absPath);
  } catch {
    throw new WorkspaceAccessError('FILE_NOT_FOUND', 'File not found');
  }
  if (stat.isDirectory()) {
    throw new WorkspaceAccessError('FILE_NOT_FOUND', 'Path is a directory');
  }
  if (stat.size > maxBytes) {
    throw new WorkspaceAccessError('FILE_TOO_LARGE', 'File exceeds the size limit');
  }

  const content = await fs.promises.readFile(absPath, 'utf-8');
  if (content.includes('\0')) {
    throw new WorkspaceAccessError('BINARY_FILE_UNSUPPORTED', 'Binary files are not supported');
  }
  return content;
}

export async function listWorkspaceFiles(root: string, limits: WorkspaceLimits): Promise<string[]> {
  const resolvedRoot = await realpathSafe(root);
  if (!resolvedRoot) {
    throw new WorkspaceAccessError('FILE_NOT_FOUND', 'Workspace root not found');
  }
  const realRoot: string = resolvedRoot;

  const results: string[] = [];
  let visited = 0;

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > limits.workspaceDepth) {
      throw new WorkspaceAccessError('WORKSPACE_LIMIT_EXCEEDED', 'Workspace depth limit exceeded');
    }
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_ENTRIES.has(entry.name)) continue;
      visited++;
      if (visited > limits.workspaceEntries) {
        throw new WorkspaceAccessError('WORKSPACE_LIMIT_EXCEEDED', 'Workspace entry limit exceeded');
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        const target = await realpathSafe(fullPath);
        if (!target || !isContained(realRoot, target)) continue;
        const stat = await fs.promises.stat(fullPath).catch(() => undefined);
        if (stat?.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else if (stat?.isFile()) {
          results.push(path.relative(realRoot, fullPath).split(path.sep).join('/'));
        }
        continue;
      }
      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        results.push(path.relative(realRoot, fullPath).split(path.sep).join('/'));
      }
    }
  }

  await walk(realRoot, 0);
  return results.sort();
}
