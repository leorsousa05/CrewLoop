import type { Session, DashboardState, ClientSession, ClientEvent, ClientWebSocketMessage } from './types';

export function presentEvent(event: Session['events'][number]): ClientEvent {
  return {
    id: event.id,
    timestamp: event.timestamp,
    event_type: event.event_type,
    tool: event.tool,
    detail: event.detail,
    status: event.status,
    duration_ms: event.duration_ms,
    skill: event.skill,
  };
}

export function presentSession(session: Session): ClientSession {
  return {
    id: session.id,
    source: session.source,
    skill: session.active_skill,
    activeSkill:
      session.active_skill
        ? {
            name: session.active_skill,
            confidence: session.active_confidence || 'unknown',
          }
        : undefined,
    status: session.status,
    lifecycle: session.lifecycle,
    events: session.events.map(presentEvent),
    startTime: session.started_at,
    lastActivity: session.last_event_at,
    endedAt: session.ended_at,
    toolCounts: session.tool_counts,
  };
}

export function presentState(state: DashboardState): ClientSession[] {
  return Object.values(state.sessions).map(presentSession);
}

export function createSnapshotMessage(sessions: Session[]): ClientWebSocketMessage {
  return {
    type: 'snapshot',
    sessions: sessions.map(presentSession),
  };
}

export function createUpdateMessage(
  session: Session,
  activeSessionId?: string
): ClientWebSocketMessage {
  return {
    type: 'update',
    session: presentSession(session),
    isActive: activeSessionId === session.id,
  };
}
