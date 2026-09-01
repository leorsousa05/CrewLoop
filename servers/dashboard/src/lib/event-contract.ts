import path from 'node:path';
import type { DashboardEvent, EventStatus, EventType, OperationType } from '../types';

const EVENT_TYPES: ReadonlySet<string> = new Set<EventType>([
  'session_start',
  'session_end',
  'tool_start',
  'tool_end',
  'skill_change',
]);
const EVENT_STATUSES: ReadonlySet<string> = new Set<EventStatus>([
  'running',
  'success',
  'error',
]);
const OPERATION_TYPES: ReadonlySet<string> = new Set<OperationType>([
  'read',
  'edit',
  'other',
]);
const AGENT_SOURCES: ReadonlySet<string> = new Set([
  'kimi',
  'claude',
  'codex',
  'opencode',
  'log-watcher',
  'agy',
]);
const EVENT_KEYS: ReadonlySet<string> = new Set([
  'id',
  'timestamp',
  'source',
  'session_id',
  'event_type',
  'invocation_id',
  'skill',
  'default_skill',
  'tool',
  'operationType',
  'detail',
  'status',
  'duration_ms',
  'token_usage',
  'token_usages',
  'input',
  'output',
  'workspacePath',
]);

const MAX_ID_LENGTH = 200;
const MAX_DETAIL_LENGTH = 2_000;
const MAX_EVENT_TIMESTAMP = 4_102_444_800_000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isBoundedString(value: unknown, max = MAX_ID_LENGTH): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function isSafeTimestamp(value: unknown): value is number {
  return Number.isSafeInteger(value)
    && (value as number) >= 0
    && (value as number) <= MAX_EVENT_TIMESTAMP;
}

function isValidTokenMeasurement(value: unknown): boolean {
  // Measurement values are validated and normalized by the telemetry layer.
  // The event contract only guarantees that the optional container is shaped
  // correctly, preserving the existing "unavailable telemetry" fallback.
  return isPlainObject(value);
}

export function validateDashboardEvent(value: unknown): value is DashboardEvent {
  if (!isPlainObject(value)) return false;

  for (const key of Object.keys(value)) {
    if (!EVENT_KEYS.has(key)) return false;
  }

  const event = value as Record<string, unknown>;
  if (!isBoundedString(event.id)) return false;
  if (!isSafeTimestamp(event.timestamp)) return false;
  if (!AGENT_SOURCES.has(event.source as string)) return false;
  if (!isBoundedString(event.session_id)) return false;
  if (!EVENT_TYPES.has(event.event_type as string)) return false;

  if (event.invocation_id !== undefined && !isBoundedString(event.invocation_id)) return false;
  for (const key of ['skill', 'default_skill', 'tool'] as const) {
    if (event[key] !== undefined && !isBoundedString(event[key])) return false;
  }
  if (event.operationType !== undefined && !OPERATION_TYPES.has(event.operationType as string)) return false;
  if (event.detail !== undefined && !isBoundedString(event.detail, MAX_DETAIL_LENGTH)) return false;
  if (event.status !== undefined && !EVENT_STATUSES.has(event.status as string)) return false;
  if (event.duration_ms !== undefined
    && (typeof event.duration_ms !== 'number' || !Number.isFinite(event.duration_ms) || event.duration_ms < 0)) {
    return false;
  }
  if (event.input !== undefined && !isPlainObject(event.input)) return false;
  if (event.output !== undefined && !isPlainObject(event.output)) return false;
  if (event.workspacePath !== undefined
    && (!isBoundedString(event.workspacePath, 4_096) || !path.isAbsolute(event.workspacePath))) {
    return false;
  }
  if (event.token_usage !== undefined && !isValidTokenMeasurement(event.token_usage)) return false;
  if (event.token_usages !== undefined
    && (!Array.isArray(event.token_usages)
      || event.token_usages.length > 128
      || !event.token_usages.every(isValidTokenMeasurement))) {
    return false;
  }

  if ((event.event_type === 'tool_start' || event.event_type === 'tool_end')
    && event.tool !== undefined
    && !isBoundedString(event.tool)) {
    return false;
  }

  return true;
}
