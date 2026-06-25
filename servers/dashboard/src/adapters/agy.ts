import type { AgentSource, DashboardEvent, EventType } from '../types';

export interface AgyToolCall {
  name?: string;
  args?: Record<string, unknown>;
}

export interface AgyHookPayload {
  sessionId?: string;
  session_id?: string;
  conversationId?: string;
  turnId?: string;
  cwd?: string;
  transcriptPath?: string;
  model?: string;
  permissionMode?: string;
  callId?: string;
  hook_event_name?: string;
  toolName?: string;
  toolKind?: string;
  toolInput?: Record<string, unknown>;
  toolResponse?: Record<string, unknown>;
  toolCall?: AgyToolCall;
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
  Stop: 'session_end',
};

export function normalizeAgy(payload: AgyHookPayload): DashboardEvent | undefined {
  const eventName = payload.hook_event_name || 'PostToolUse';
  const event_type = EVENT_MAP[eventName];
  if (!event_type) {
    return undefined;
  }

  const tool = payload.toolName || payload.toolCall?.name;

  return {
    id: generateId(),
    timestamp: Date.now(),
    source: 'agy' as AgentSource,
    session_id: payload.sessionId || payload.session_id || payload.conversationId || 'unknown',
    event_type,
    tool,
    skill: payload.skill,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
