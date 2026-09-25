import type { AgentSource, DashboardEvent, EventStatus, EventType } from '../types';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';
import { parseCapturedAt, stableUsageId, usdToMicrousd } from './usage-utils';

const TOKEN_USAGE_ALIASES: TokenUsageAliases = {
  input: ['input', 'input_tokens'],
  output: ['output', 'output_tokens'],
  cacheRead: ['cache_read', 'cacheRead'],
  cacheWrite: ['cache_write', 'cacheWrite'],
  reasoning: ['reasoning', 'reasoning_tokens'],
  total: ['total', 'total_tokens'],
};

export interface OpenCodeToolEvent {
  tool: string;
  args?: Record<string, unknown>;
  duration?: number;
  success?: boolean;
  invocation_id?: string;
}

export interface OpenCodePluginPayload {
  tool?: string;
  event_type: 'tool_start' | 'tool_end' | 'model_usage';
  cwd?: string;
  session_id?: string;
  success?: boolean;
  duration_ms?: number;
  message_id?: string;
  part_id?: string;
  invocation_id?: string;
  call_id?: string;
  tool_call_id?: string;
  captured_at?: number | string;
  final?: boolean;
  model?: string;
  usage?: unknown;
  cost_usd?: number;
}

export function normalizeOpenCode(
  payload: OpenCodePluginPayload
): DashboardEvent | undefined {
  if (payload.event_type === 'model_usage') {
    return normalizeModelUsage(payload);
  }
  if (!payload.tool || (payload.event_type !== 'tool_start' && payload.event_type !== 'tool_end')) {
    return undefined;
  }

  const eventType = payload.event_type;
  const status: EventStatus = eventType === 'tool_start'
    ? 'running'
    : payload.success === false ? 'error' : 'success';
  const rawDuration = payload.duration_ms;
  const duration_ms = typeof rawDuration === 'number'
    && Number.isFinite(rawDuration)
    && rawDuration >= 0
    ? rawDuration
    : undefined;
  return {
    id: generateId(),
    timestamp: Date.now(),
    source: 'opencode' as AgentSource,
    session_id: payload.session_id || process.cwd(),
    event_type: eventType,
    invocation_id: payload.invocation_id ?? payload.call_id ?? payload.tool_call_id,
    tool: payload.tool,
    status,
    duration_ms,
    workspacePath: payload.cwd,
  };
}

function normalizeModelUsage(payload: OpenCodePluginPayload): DashboardEvent | undefined {
  const sessionId = payload.session_id;
  const stableIdentity = payload.part_id ?? payload.message_id;
  if (!sessionId || !stableIdentity) {
    return undefined;
  }

  const capturedAt = parseCapturedAt(payload.captured_at);
  const identityKind = payload.part_id ? 'part' : 'message';
  const measurementId = stableUsageId(`opencode:${identityKind}`, stableIdentity);
  const token_usage = payload.final === true && capturedAt !== undefined
    ? normalizeTokenUsage({
        source: 'opencode',
        rawUsage: payload.usage,
        model: payload.model,
        eventId: measurementId,
        capturedAt,
        semantics: 'delta',
        aliases: TOKEN_USAGE_ALIASES,
        cursorKey: `opencode:${identityKind}`,
        reportedCostMicrousd: usdToMicrousd(payload.cost_usd),
        coverage: 'complete',
      })
    : undefined;

  return {
    id: stableUsageId('opencode:model-event', identityKind, stableIdentity),
    timestamp: capturedAt ?? Date.now(),
    source: 'opencode',
    session_id: sessionId,
    event_type: 'tool_end',
    tool: 'Model',
    status: 'success',
    token_usage,
    workspacePath: payload.cwd,
  };
}

export function createOpenCodeEvent(
  sessionId: string,
  eventType: EventType,
  data: OpenCodeToolEvent
): DashboardEvent {
  let status: EventStatus | undefined;
  if (eventType === 'tool_end') {
    status = data.success === false ? 'error' : 'success';
  } else if (eventType === 'tool_start') {
    status = 'running';
  }

  return {
    id: generateId(),
    timestamp: Date.now(),
    source: 'opencode' as AgentSource,
    session_id: sessionId,
    event_type: eventType,
    invocation_id: data.invocation_id,
    tool: data.tool,
    status,
    duration_ms: data.duration,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
