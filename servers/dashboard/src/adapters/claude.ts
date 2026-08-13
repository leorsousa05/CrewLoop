import type { AgentSource, DashboardEvent, EventType } from '../types';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';
import { normalizeClaudeUsageTotal, readClaudeSessionTokenUsage } from './claude-session';
import { parseCapturedAt, stableUsageId } from './usage-utils';

export interface ClaudeHookPayload {
  hook_event_name: string;
  session_id: string;
  transcript_path?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: string | Record<string, unknown>;
  // SessionStart carries `source` (startup|resume|clear); SessionEnd carries `reason`.
  source?: string;
  reason?: string;
  usage?: unknown;
  model?: string;
  message_id?: string;
  request_id?: string;
  timestamp?: number | string;
  skill?: string;
}

export interface ClaudeNormalizationOptions {
  projectsRoot?: string;
}

const TOKEN_USAGE_ALIASES: TokenUsageAliases = {
  input: ['input_tokens', 'inputTokens'],
  output: ['output_tokens', 'outputTokens'],
  cacheRead: ['cache_read_input_tokens', 'cacheReadInputTokens'],
  cacheWrite: ['cache_creation_input_tokens', 'cacheCreationInputTokens'],
  reasoning: ['reasoning_tokens', 'reasoningTokens'],
  total: ['total_tokens', 'totalTokens'],
};

const EVENT_MAP: Record<string, EventType> = {
  PreToolUse: 'tool_start',
  PostToolUse: 'tool_end',
  SessionStart: 'session_start',
  SessionEnd: 'session_end',
};

export function normalizeClaude(
  payload: ClaudeHookPayload,
  options: ClaudeNormalizationOptions = {}
): DashboardEvent | undefined {
  const event_type = EVENT_MAP[payload.hook_event_name];
  if (!event_type) {
    return undefined;
  }

  const timestamp = parseCapturedAt(payload.timestamp) ?? Date.now();
  const sessionId = payload.session_id || 'unknown';
  const directIdentity = payload.message_id ?? payload.request_id;
  const directTokenUsage = directIdentity
    ? normalizeTokenUsage({
        source: 'claude',
        rawUsage: normalizeClaudeUsageTotal(payload.usage),
        model: payload.model,
        eventId: stableUsageId('claude:direct', directIdentity),
        capturedAt: timestamp,
        semantics: 'delta',
        aliases: TOKEN_USAGE_ALIASES,
        cursorKey: 'claude:direct-message',
        coverage: 'complete',
      })
    : undefined;
  const token_usage = directTokenUsage ?? readClaudeSessionTokenUsage({
    transcriptPath: payload.transcript_path,
    sessionId,
    model: payload.model,
    projectsRoot: options.projectsRoot,
  });

  return {
    id: generateId(),
    timestamp,
    source: 'claude' as AgentSource,
    session_id: sessionId,
    event_type,
    tool: payload.tool_name,
    skill: payload.skill,
    detail: event_type === 'session_end' && typeof payload.reason === 'string'
      ? payload.reason.length > 200
        ? `${payload.reason.slice(0, 197)}...`
        : payload.reason
      : undefined,
    input: payload.tool_input,
    output: normalizeOutput(payload.tool_response),
    token_usage,
    workspacePath: payload.cwd,
  };
}

function normalizeOutput(
  output: string | Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (output === undefined) return undefined;
  if (typeof output === 'string') return { output };
  return output;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
