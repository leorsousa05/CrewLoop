import type { DashboardEvent, Session, DashboardState, AgentSource, EventStatus } from './types';

export interface StateStoreOptions {
  maxEventsPerSession: number;
  sessionMaxAgeMs: number;
}

export class StateStore {
  private sessions: Map<string, Session> = new Map();
  private options: StateStoreOptions;

  constructor(options: StateStoreOptions) {
    this.options = options;
  }

  applyEvent(event: DashboardEvent): Session {
    let session = this.sessions.get(event.session_id);

    if (!session) {
      session = this.createSession(event.session_id, event.source);
    }

    session.source = event.source;
    session.last_event_at = event.timestamp;
    session.events.unshift(event);

    if (session.events.length > this.options.maxEventsPerSession) {
      session.events.length = this.options.maxEventsPerSession;
    }

    if (event.tool) {
      session.tool_counts[event.tool] = (session.tool_counts[event.tool] || 0) + 1;
    }

    if (event.skill) {
      session.active_skill = event.skill;
      session.active_confidence = event.event_type === 'skill_change' ? 'explicit' : 'heuristic';
    }

    session.status = deriveSessionStatus(event);

    this.sessions.set(event.session_id, session);
    return session;
  }

  setActiveSkill(
    sessionId: string,
    skill: string | undefined,
    confidence: 'explicit' | 'heuristic' | 'unknown'
  ): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }
    session.active_skill = skill;
    session.active_confidence = confidence;
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.last_event_at - a.last_event_at
    );
  }

  getState(): DashboardState {
    return {
      sessions: Object.fromEntries(this.sessions),
    };
  }

  pruneInactive(now: number = Date.now()): number {
    let removed = 0;
    for (const [id, session] of this.sessions) {
      if (now - session.last_event_at > this.options.sessionMaxAgeMs) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }

  private createSession(id: string, source: AgentSource): Session {
    const now = Date.now();
    const session: Session = {
      id,
      source,
      events: [],
      tool_counts: {},
      started_at: now,
      last_event_at: now,
    };
    this.sessions.set(id, session);
    return session;
  }
}

function deriveSessionStatus(event: DashboardEvent): EventStatus | undefined {
  switch (event.event_type) {
    case 'session_start':
    case 'tool_start':
    case 'skill_change':
      return 'running';
    case 'tool_end':
      return event.status || 'success';
    case 'session_end':
      return 'success';
    default:
      return undefined;
  }
}
