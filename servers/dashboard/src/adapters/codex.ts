import type { AgentSource, DashboardEvent, EventType } from '../types';

export interface CodexHookPayload {
  sessionId?: string;
  session_id?: string;
  turnId?: string;
  cwd?: string;
  transcriptPath?: string;
  model?: string;
  permissionMode?: string;
  callId?: string;
  toolName?: string;
  toolKind?: string;
  toolInput?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  hook_event_name?: string;
  stop_reason?: string;
  usage?: unknown;
  executed?: boolean;
  success?: boolean;
  durationMs?: number;
  skill?: string;
}

const EVENT_MAP: Record<string, EventType> = {
  PreToolUse: 'tool_start',
  PostToolUse: 'tool_end',
  SessionStart: 'session_start',
  SessionEnd: 'session_end',
  Stop: 'session_end',
};

export function normalizeCodex(payload: CodexHookPayload): DashboardEvent | undefined {
  const eventName = payload.hook_event_name || 'PostToolUse';
  const event_type = EVENT_MAP[eventName];
  if (!event_type) {
    return undefined;
  }

  return {
    id: generateId(),
    timestamp: Date.now(),
    source: 'codex' as AgentSource,
    session_id: payload.sessionId || payload.session_id || 'unknown',
    event_type,
    tool: payload.toolName,
    skill: payload.skill,
    input: payload.toolInput,
    output: payload.toolResponse,
    workspacePath: payload.cwd,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
