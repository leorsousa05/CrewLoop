import type { OperationType } from '../types';

// Tool names across all supported agents (Kimi, Claude, Codex, AGY),
// normalized to lowercase for lookup.
const EDIT_TOOLS = new Set([
  'edit',
  'multiedit',
  'write',
  'notebookedit',
  'editfile',
  'writefile',
  'strreplacefile',
  'write_to_file',
  'replace_file_content',
  'multi_replace_file_content',
  'append_to_file',
  'apply_patch',
  'create_file',
  'str_replace_editor',
  'edit_file',
]);

const READ_TOOLS = new Set([
  'read',
  'readfile',
  'read_file',
  'view_file',
  'cat',
  'glob',
  'grep',
  'list_dir',
  'listdir',
  'find_by_name',
  'grep_search',
  'search_code',
  'codebase_search',
  'notebookread',
  'readmediafile',
  'ls',
]);

export function classifyOperation(toolName: string): OperationType {
  const normalized = toolName.toLowerCase().trim();
  if (EDIT_TOOLS.has(normalized)) {
    return 'edit';
  }
  if (READ_TOOLS.has(normalized)) {
    return 'read';
  }
  return 'other';
}

// Path-bearing keys in tool payloads, in priority order. Covers the input
// signatures of Kimi/Claude (file_path, path, notebook_path), Codex
// (path, filePath) and AGY (AbsolutePath, TargetFile).
const PATH_KEYS = [
  'file_path',
  'path',
  'filePath',
  'filepath',
  'absolute_path',
  'AbsolutePath',
  'absolutepath',
  'TargetFile',
  'target_file',
  'targetfile',
  'notebook_path',
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pathFromObject(obj: Record<string, unknown>): string | undefined {
  for (const key of PATH_KEYS) {
    const value = obj[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

/**
 * Extracts the affected file path from a tool payload based on the known
 * input signatures of the supported agents. Returns undefined when the
 * payload carries no file path. The tool name is part of the shared-shim
 * contract; path keys are currently unambiguous across agents.
 */
export function extractFileDetail(
  _toolName: string | undefined,
  payload: unknown
): string | undefined {
  if (!isPlainObject(payload)) {
    return undefined;
  }

  const direct = pathFromObject(payload);
  if (direct) {
    return direct;
  }

  if (isPlainObject(payload.args)) {
    const nested = pathFromObject(payload.args);
    if (nested) {
      return nested;
    }
  }

  // Codex apply_patch style: { operations: [{ path | file_path }] }.
  if (Array.isArray(payload.operations)) {
    for (const op of payload.operations) {
      if (isPlainObject(op)) {
        const opPath = pathFromObject(op);
        if (opPath) {
          return opPath;
        }
      }
    }
  }

  return undefined;
}
