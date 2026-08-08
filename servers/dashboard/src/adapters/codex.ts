import type { AgentSource, DashboardEvent, EventType } from '../types';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';
import { readCodexSessionTokenUsage } from './codex-session';
import { extractCodexPatchMetadata } from './codex-tool-metadata';

export interface CodexHookPayload {
  sessionId?: string;
  session_id?: string;
  turnId?: string;
  cwd?: string;
  transcriptPath?: string;
  transcript_path?: string;
  model?: string;
  permissionMode?: string;
  callId?: string;
  toolName?: string;
  tool_name?: string;
  toolKind?: string;
  toolInput?: Record<string, unknown>;
  tool_input?: Record<string, unknown>;
  toolResponse?: string | Record<string, unknown>;
  tool_response?: string | Record<string, unknown>;
  hook_event_name?: string;
  stop_reason?: string;
  usage?: unknown;
  executed?: boolean;
  success?: boolean;
  durationMs?: number;
  skill?: string;
}

export interface CodexNormalizationOptions {
  sessionsRoot?: string;
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

export function normalizeCodex(
  payload: CodexHookPayload,
  options: CodexNormalizationOptions = {}
): DashboardEvent | undefined {
  const eventName = payload.hook_event_name || 'PostToolUse';
  const event_type = EVENT_MAP[eventName];
  if (!event_type) {
    return undefined;
  }

  const id = generateId();
  const timestamp = Date.now();
  const sessionId = payload.sessionId || payload.session_id || 'unknown';
  const tool = firstString(payload.toolName, payload.tool_name);
  const rawInput = firstRecord(payload.toolInput, payload.tool_input);
  const directTokenUsage = normalizeTokenUsage({
    source: 'codex',
    rawUsage: payload.usage,
    model: payload.model,
    eventId: `${sessionId}:${eventName}:${payload.callId || payload.turnId || id}`,
    capturedAt: timestamp,
    semantics: 'cumulative',
    aliases: TOKEN_USAGE_ALIASES,
  });
  const token_usage = directTokenUsage || readCodexSessionTokenUsage({
    transcriptPath: payload.transcriptPath || payload.transcript_path,
    sessionId,
    model: payload.model,
    sessionsRoot: options.sessionsRoot,
  });

  return {
    id,
    timestamp,
    source: 'codex' as AgentSource,
    session_id: sessionId,
    event_type,
    tool,
    skill: payload.skill,
    input: normalizeInput(tool, rawInput),
    output: normalizeOutput(payload.toolResponse, payload.tool_response),
    token_usage,
    workspacePath: payload.cwd,
  };
}

function normalizeInput(
  tool: string | undefined,
  input: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (tool?.toLowerCase().trim() === 'apply_patch') {
    return extractCodexPatchMetadata(input);
  }
  return input;
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string');
}

function firstRecord(...values: unknown[]): Record<string, unknown> | undefined {
  return values.find(
    (value): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null && !Array.isArray(value)
  );
}

function normalizeOutput(...values: unknown[]): Record<string, unknown> | undefined {
  const output = values.find(
    (value) =>
      typeof value === 'string' ||
      (typeof value === 'object' && value !== null && !Array.isArray(value))
  );
  if (typeof output === 'string') return { output };
  return output as Record<string, unknown> | undefined;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
