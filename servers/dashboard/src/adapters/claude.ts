import type { AgentSource, DashboardEvent, EventType } from '../types';

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
  skill?: string;
}

const EVENT_MAP: Record<string, EventType> = {
  PreToolUse: 'tool_start',
  PostToolUse: 'tool_end',
  SessionStart: 'session_start',
  SessionEnd: 'session_end',
};

export function normalizeClaude(payload: ClaudeHookPayload): DashboardEvent | undefined {
  const event_type = EVENT_MAP[payload.hook_event_name];
  if (!event_type) {
    return undefined;
  }

  return {
    id: generateId(),
    timestamp: Date.now(),
    source: 'claude' as AgentSource,
    session_id: payload.session_id || 'unknown',
    event_type,
    tool: payload.tool_name,
    skill: payload.skill,
    detail: event_type === 'session_end' ? payload.reason : undefined,
    input: payload.tool_input,
    output: normalizeOutput(payload.tool_response),
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
