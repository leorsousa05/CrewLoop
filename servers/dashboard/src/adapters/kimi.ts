import type { AgentSource, DashboardEvent, EventType } from '../types';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';
import { readKimiSessionTokenUsage } from './kimi-session';

export interface KimiHookPayload {
  hook_event_name: string;
  session_id: string;
  cwd: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: string | Record<string, unknown>;
  stop_reason?: string;
  usage?: unknown;
  model?: string;
  skill?: string;
}

const EVENT_MAP: Record<string, EventType> = {
  PreToolUse: 'tool_start',
  PostToolUse: 'tool_end',
  SessionStart: 'session_start',
  SessionEnd: 'session_end',
  Stop: 'session_end',
};

const TOKEN_USAGE_ALIASES: TokenUsageAliases = {
  input: ['input_tokens', 'inputTokens', 'prompt_tokens', 'promptTokens'],
  output: ['output_tokens', 'outputTokens', 'completion_tokens', 'completionTokens'],
  cacheRead: ['cache_read_input_tokens', 'cacheReadInputTokens', 'cached_tokens', 'cachedTokens'],
  cacheWrite: ['cache_creation_input_tokens', 'cacheWriteInputTokens'],
  reasoning: ['reasoning_tokens', 'reasoningTokens'],
  total: ['total_tokens', 'totalTokens'],
};

export interface KimiNormalizationOptions {
  kimiDataDir?: string;
  eventTypeOverride?: string;
}

export function normalizeKimi(
  payload: KimiHookPayload,
  options: KimiNormalizationOptions = {}
): DashboardEvent | undefined {
  const hookName =
    payload.hook_event_name ||
    options.eventTypeOverride ||
    (payload.tool_name ? 'PreToolUse' : undefined);
  const event_type = hookName ? EVENT_MAP[hookName] : undefined;
  if (!event_type) {
    return undefined;
  }

  const id = generateId();
  const timestamp = Date.now();
  const sessionId = payload.session_id || 'unknown';
  const directTokenUsage = normalizeTokenUsage({
    source: 'kimi',
    rawUsage: payload.usage,
    model: payload.model,
    eventId: `${sessionId}:${payload.hook_event_name}:${id}`,
    capturedAt: timestamp,
    semantics: 'cumulative',
    aliases: TOKEN_USAGE_ALIASES,
  });
  const token_usage = directTokenUsage || readKimiSessionTokenUsage({
    sessionId,
    model: payload.model,
    kimiDataDir: options.kimiDataDir,
  });

  return {
    id,
    timestamp,
    source: 'kimi' as AgentSource,
    session_id: payload.session_id || 'unknown',
    event_type,
    tool: payload.tool_name,
    skill: payload.skill,
    input: normalizeInput(payload.tool_input),
    output: normalizeOutput(payload.tool_output),
    token_usage,
    workspacePath: payload.cwd,
  };
}

function normalizeInput(
  input: unknown
): Record<string, unknown> | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(input);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Fallback to wrapping
      }
    }
    return { input };
  }
  if (typeof input === 'object' && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  return undefined;
}

function normalizeOutput(
  output: string | Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (output === undefined) return undefined;
  if (typeof output === 'string') {
    const trimmed = output.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(output);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Fallback to wrapping as { output }
      }
    }
    return { output };
  }
  return output;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
