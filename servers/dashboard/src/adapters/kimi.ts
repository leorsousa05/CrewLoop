import type { AgentSource, DashboardEvent, EventType } from '../types';

export interface KimiHookPayload {
  hook_event_name: string;
  session_id: string;
  cwd: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: Record<string, unknown>;
  stop_reason?: string;
  usage?: unknown;
}

const EVENT_MAP: Record<string, EventType> = {
  PreToolUse: 'tool_start',
  PostToolUse: 'tool_end',
  SessionStart: 'session_start',
  SessionEnd: 'session_end',
  Stop: 'session_end',
};

export function normalizeKimi(payload: KimiHookPayload): DashboardEvent | undefined {
  const event_type = EVENT_MAP[payload.hook_event_name];
  if (!event_type) {
    return undefined;
  }

  return {
    id: generateId(),
    timestamp: Date.now(),
    source: 'kimi' as AgentSource,
    session_id: payload.session_id || 'unknown',
    event_type,
    tool: payload.tool_name,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
