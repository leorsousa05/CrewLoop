import type { AgentSource, DashboardEvent, EventType } from '../types';

export interface KimiHookPayload {
  hook_event_name: string;
  session_id: string;
  cwd: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: string | Record<string, unknown>;
  stop_reason?: string;
  usage?: unknown;
  skill?: string;
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
    skill: payload.skill,
    input: payload.tool_input,
    output: normalizeOutput(payload.tool_output),
    workspacePath: payload.cwd,
  };
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
