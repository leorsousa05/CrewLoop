import { SAFE_TOOL_INPUT_KEYS, DANGEROUS_TOOL_INPUT_KEYS } from '../config';
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

export function sanitizeEventBoundary(payload: Record<string, unknown>): boolean {
  const keys = Object.keys(payload);
  for (const key of keys) {
    if (DANGEROUS_TOOL_INPUT_KEYS.has(key.toLowerCase())) {
      return false;
    }
  }
  return true;
}
