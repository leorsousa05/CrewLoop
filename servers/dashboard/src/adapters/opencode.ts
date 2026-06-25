import type { AgentSource, DashboardEvent, EventType, EventStatus } from '../types';

export interface OpenCodeToolEvent {
  tool: string;
  args?: Record<string, unknown>;
  duration?: number;
  success?: boolean;
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
    tool: data.tool,
    status,
    duration_ms: data.duration,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
