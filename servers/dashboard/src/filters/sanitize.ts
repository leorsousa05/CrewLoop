import {
  SAFE_TOOL_INPUT_KEYS,
  DANGEROUS_TOOL_INPUT_KEYS,
  SAFE_PAYLOAD_KEYS,
  DANGEROUS_PAYLOAD_KEYS,
  MAX_PAYLOAD_STRING_LENGTH,
  MAX_BASE64_STRING_LENGTH,
  MAX_PAYLOAD_DEPTH,
} from '../config';
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
    return sanitizeValue(payload, 0, false) as Record<string, unknown>;
  } catch {
    return undefined;
  }
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
