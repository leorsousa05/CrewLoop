import { SAFE_TOOL_INPUT_KEYS, DANGEROUS_TOOL_INPUT_KEYS } from '../config';
import type { EventStatus } from '../types';

export interface SanitizeInput {
  tool_name: string;
  tool_input?: Record<string, unknown>;
  tool_response?: unknown;
}

export interface SanitizedToolData {
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

const MAX_COMMAND_DETAIL_LENGTH = 80;
const MAX_SAFE_STRING_LENGTH = 240;
const MAX_SAFE_OUTPUT_STRING_LENGTH = 480;
const MAX_CONTENT_SNIPPET_LENGTH = 240;

const ALLOWED_TRUNCATED_INPUT_KEYS = new Set(['command']);
const SAFE_VALUE_TYPES = new Set(['string', 'number', 'boolean']);

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractContentSnippet(response: unknown): string | undefined {
  if (typeof response === 'string') {
    return response.trim().length > 0 ? response : undefined;
  }

  if (!isPlainObject(response)) {
    return undefined;
  }

  const candidates = [response.content, response.result, response.stdout, response.stderr, response.output];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (Array.isArray(value)) {
      const joined = value.map(String).join('\n');
      if (joined.trim().length > 0) {
        return joined;
      }
    }
  }

  return undefined;
}

function extractSafeDetail(input: Record<string, unknown>): string | undefined {
  for (const [key, value] of Object.entries(input)) {
    const lower = key.toLowerCase();
    if (!SAFE_TOOL_INPUT_KEYS.has(lower)) {
      continue;
    }
    if (typeof value === 'string') {
      if (lower === 'url') {
        try {
          const url = new URL(value);
          return url.hostname;
        } catch {
          return undefined;
        }
      }
      return value;
    }
  }

  const command = input.command;
  if (typeof command === 'string') {
    return truncate(command, MAX_COMMAND_DETAIL_LENGTH);
  }

  return undefined;
}

function shouldKeepKey(key: string): boolean {
  const lower = key.toLowerCase();
  return ALLOWED_TRUNCATED_INPUT_KEYS.has(lower) || !DANGEROUS_TOOL_INPUT_KEYS.has(lower);
}

function extractSafeObject(
  obj: Record<string, unknown> | undefined,
  maxStringLength: number
): Record<string, unknown> | undefined {
  if (!isPlainObject(obj)) {
    return undefined;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!shouldKeepKey(key)) {
      continue;
    }

    if (typeof value === 'string') {
      const maxLength = ALLOWED_TRUNCATED_INPUT_KEYS.has(key.toLowerCase())
        ? MAX_COMMAND_DETAIL_LENGTH
        : maxStringLength;
      out[key] = truncate(value, maxLength);
    } else if (SAFE_VALUE_TYPES.has(typeof value)) {
      out[key] = value;
    } else if (isPlainObject(value)) {
      const nested = extractSafeObject(value, maxStringLength);
      if (nested !== undefined && Object.keys(nested).length > 0) {
        out[key] = nested;
      }
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function addResponseContentSnippet(
  output: Record<string, unknown> | undefined,
  response: unknown
): Record<string, unknown> | undefined {
  const content = extractContentSnippet(response);
  if (typeof content !== 'string') {
    return output;
  }
  const safe = output || {};
  if (!('contentSnippet' in safe)) {
    safe.contentSnippet = truncate(content, MAX_SAFE_OUTPUT_STRING_LENGTH);
  }
  return safe;
}

function isWriteTool(toolName: string): boolean {
  return toolName.toLowerCase() === 'write';
}

function isEditTool(toolName: string): boolean {
  const t = toolName.toLowerCase();
  return t === 'edit' || t === 'editfile';
}

function buildEditDiff(oldString: string, newString: string): string {
  const oldLines = oldString.split('\n').slice(0, 40);
  const newLines = newString.split('\n').slice(0, 40);
  const lines: string[] = [];
  for (const line of oldLines) lines.push(`- ${line}`);
  for (const line of newLines) lines.push(`+ ${line}`);
  return truncate(lines.join('\n'), MAX_SAFE_OUTPUT_STRING_LENGTH);
}

function getString(input: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!input) return undefined;
  for (const key of keys) {
    const value = input[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function addToolInputSnippet(
  output: Record<string, unknown> | undefined,
  toolName: string,
  toolInput: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!toolInput) return output;

  const safe = output || {};

  if (isWriteTool(toolName) && !safe.diff && !safe.contentSnippet) {
    const content = getString(toolInput, ['content', 'text', 'code']);
    if (content) {
      safe.contentSnippet = truncate(content, MAX_CONTENT_SNIPPET_LENGTH);
    }
  }

  if (isEditTool(toolName) && !safe.diff) {
    const oldString = getString(toolInput, ['old_string', 'oldString', 'old']);
    const newString = getString(toolInput, ['new_string', 'newString', 'new']);
    if (oldString !== undefined && newString !== undefined) {
      safe.diff = buildEditDiff(oldString, newString);
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}

export function sanitize(input: SanitizeInput, event: 'pre' | 'post'): SanitizedToolData {
  const result: SanitizedToolData = {};

  if (input.tool_input) {
    const detail = extractSafeDetail(input.tool_input);
    if (detail) {
      result.detail = detail;
    }
    result.input = extractSafeObject(input.tool_input, MAX_SAFE_STRING_LENGTH);
  }

  if (event === 'post' && input.tool_response !== undefined && input.tool_response !== null) {
    if (typeof input.tool_response === 'string') {
      result.status = 'success';
      result.output = addToolInputSnippet(
        addResponseContentSnippet({}, input.tool_response),
        input.tool_name,
        input.tool_input
      );
    } else if (isPlainObject(input.tool_response)) {
      const response = input.tool_response as Record<string, unknown>;

      if (typeof response.duration_ms === 'number') {
        result.duration_ms = response.duration_ms;
      } else if (typeof response.durationMs === 'number') {
        result.duration_ms = response.durationMs;
      }

      if (response.is_error === true || response.success === false || response.error) {
        result.status = 'error';
      } else if (response.success === true || response.is_error === false) {
        result.status = 'success';
      }

      result.output = addToolInputSnippet(
        addResponseContentSnippet(
          extractSafeObject(response, MAX_SAFE_OUTPUT_STRING_LENGTH),
          response
        ),
        input.tool_name,
        input.tool_input
      );
    }
  }

  if (event === 'pre') {
    result.status = 'running';
  }

  return result;
}

export function sanitizeEventBoundary(payload: Record<string, unknown>): boolean {
  const keys = Object.keys(payload);
  for (const key of keys) {
    if (DANGEROUS_TOOL_INPUT_KEYS.has(key.toLowerCase())) {
      return false;
    }
  }
  return true;
}
