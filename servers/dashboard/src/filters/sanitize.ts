import {
  SAFE_TOOL_INPUT_KEYS,
  DANGEROUS_TOOL_INPUT_KEYS,
  SAFE_PAYLOAD_KEYS,
  DANGEROUS_PAYLOAD_KEYS,
  MAX_PAYLOAD_STRING_LENGTH,
  MAX_BASE64_STRING_LENGTH,
  MAX_PAYLOAD_DEPTH,
} from '../config';
import { extractCodexPatchMetadata } from '../adapters/codex-tool-metadata';
import type { EventStatus } from '../types';

export interface SanitizeInput {
  tool_name: string;
  tool_input?: Record<string, unknown>;
  tool_response?: Record<string, unknown>;
}

export interface SafeDetail {
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
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
  return undefined;
}

export function sanitize(input: SanitizeInput, event: 'pre' | 'post'): SafeDetail {
  const result: SafeDetail = {};

  if (input.tool_input) {
    const detail = extractSafeDetail(input.tool_input);
    if (detail) {
      result.detail = detail;
    }
  }

  if (event === 'post' && input.tool_response && typeof input.tool_response === 'object') {
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
  }

  if (event === 'pre') {
    result.status = 'running';
  }

  return result;
}

const BASE64_RE = /^(?:data:[\w/+.-]+;base64,)?[A-Za-z0-9+/=\r\n]+$/;
const DANGEROUS_INPUT_PAYLOAD_KEYS = new Set([
  ...DANGEROUS_TOOL_INPUT_KEYS,
  ...DANGEROUS_PAYLOAD_KEYS,
]);
const MAX_CANONICAL_OPERATIONS = 100;

function truncateString(value: string, preserve: boolean): string {
  if (!preserve && value.length > MAX_BASE64_STRING_LENGTH && BASE64_RE.test(value)) {
    return `${value.slice(0, MAX_BASE64_STRING_LENGTH)}…[truncated ${value.length - MAX_BASE64_STRING_LENGTH} chars]`;
  }
  if (value.length > MAX_PAYLOAD_STRING_LENGTH) {
    return `${value.slice(0, MAX_PAYLOAD_STRING_LENGTH)}…[truncated ${value.length - MAX_PAYLOAD_STRING_LENGTH} chars]`;
  }
  return value;
}

function sanitizeValue(value: unknown, depth: number, preserve: boolean): unknown {
  if (depth > MAX_PAYLOAD_DEPTH) {
    return '[max depth exceeded]';
  }
  if (typeof value === 'string') {
    return truncateString(value, preserve);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1, preserve));
  }
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (DANGEROUS_PAYLOAD_KEYS.has(lower)) {
      continue;
    }
    // Safe keys carry diffs/snippets/paths the UI must render; skip the
    // aggressive base64 truncation for them (the hard length cap still applies).
    result[key] = sanitizeValue(entry, depth + 1, preserve || SAFE_PAYLOAD_KEYS.has(lower));
  }
  return result;
}

/**
 * Sanitizes a tool input/output payload for storage and broadcast.
 *
 * - Removes secret-bearing keys (tokens, credentials) recursively.
 * - Truncates long base64 blobs and oversized strings.
 * - Preserves keys the UI needs to render diffs and snippets
 *   (content, diff, snippet, file paths, queries).
 * - Never throws: on failure the payload is dropped entirely.
 */
export function sanitizeToolPayload(payload: unknown): Record<string, unknown> | undefined {
  if (payload === undefined || payload === null) {
    return undefined;
  }
  try {
    if (typeof payload === 'string') {
      return { output: truncateString(payload, false) };
    }
    if (typeof payload !== 'object') {
      return { output: payload };
    }
    if (Array.isArray(payload)) {
      return { output: sanitizeValue(payload, 0, false) };
    }
    return revalidateOperationDiffs(
      sanitizeValue(payload, 0, false) as Record<string, unknown>
    );
  } catch {
    return undefined;
  }
}

export function sanitizeToolInputPayload(
  payload: unknown
): Record<string, unknown> | undefined {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return undefined;
  }
  try {
    const sanitized = sanitizeInputValue(payload, 0, false);
    if (
      typeof sanitized !== 'object' ||
      sanitized === null ||
      Array.isArray(sanitized) ||
      Object.keys(sanitized).length === 0
    ) {
      return undefined;
    }
    return revalidateOperationDiffs(sanitized as Record<string, unknown>);
  } catch {
    return undefined;
  }
}

function sanitizeInputValue(value: unknown, depth: number, preserve: boolean): unknown {
  if (depth > MAX_PAYLOAD_DEPTH) {
    return '[max depth exceeded]';
  }
  if (typeof value === 'string') {
    return truncateString(value, preserve);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    const result = value
      .map((item) => sanitizeInputValue(item, depth + 1, preserve))
      .filter((item) => item !== undefined);
    return result.length > 0 ? result : undefined;
  }

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (DANGEROUS_INPUT_PAYLOAD_KEYS.has(lower)) {
      continue;
    }
    const sanitized = sanitizeInputValue(
      entry,
      depth + 1,
      preserve || SAFE_PAYLOAD_KEYS.has(lower)
    );
    if (sanitized !== undefined) {
      result[key] = sanitized;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function revalidateOperationDiffs(
  payload: Record<string, unknown>
): Record<string, unknown> {
  if (!Array.isArray(payload.operations)) {
    return payload;
  }

  const operations = payload.operations.slice(0, MAX_CANONICAL_OPERATIONS);
  const command = operations
    .filter(isPlainObject)
    .map((operation) => operation.diff)
    .filter((diff): diff is string => typeof diff === 'string')
    .join('\n');
  const safeMetadata = command
    ? extractCodexPatchMetadata({ command })
    : undefined;
  const safeDiffs = new Map(
    (safeMetadata?.operations || []).map((operation) => [
      operation.path,
      operation.diff,
    ])
  );

  return {
    ...payload,
    operations: operations.map((operation) => {
      if (!isPlainObject(operation)) {
        return operation;
      }

      const safeOperation = { ...operation };
      if (!Object.prototype.hasOwnProperty.call(safeOperation, 'diff')) {
        return safeOperation;
      }

      const path = [safeOperation.path, safeOperation.file_path, safeOperation.filePath]
        .find((value): value is string => typeof value === 'string');
      const safeDiff = path ? safeDiffs.get(path) : undefined;
      if (safeDiff) {
        safeOperation.diff = safeDiff;
      } else {
        delete safeOperation.diff;
      }
      return safeOperation;
    }),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
