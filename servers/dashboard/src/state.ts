import type {
  AgentSource,
  ClientTokenUsage,
  CodingAgentProduct,
  DashboardEvent,
  DashboardState,
  EventStatus,
  Session,
  SessionTokenUsage,
} from './types';
import {
  createEmptySessionTokenUsage,
  mergeTokenUsage,
  tokenUsageCursorKey,
} from './telemetry/token-usage';
import type { TokenUsageRepository } from './telemetry/usage-repository';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const RUNTIME_ROOTS_FILE = path.join(os.tmpdir(), 'crewloop-session-roots.json');

function saveSessionRootMapping(sessionId: string, workspaceRoot: string) {
  try {
    let current: Record<string, string> = {};
    if (fs.existsSync(RUNTIME_ROOTS_FILE)) {
      current = JSON.parse(fs.readFileSync(RUNTIME_ROOTS_FILE, 'utf-8'));
    }
    current[sessionId] = workspaceRoot;
    fs.writeFileSync(RUNTIME_ROOTS_FILE, JSON.stringify(current, null, 2));
  } catch {}
}

function loadSessionRootMappings(): Record<string, string> {
  try {
    if (fs.existsSync(RUNTIME_ROOTS_FILE)) {
      return JSON.parse(fs.readFileSync(RUNTIME_ROOTS_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function removeSessionRootMappings(sessionIds: readonly string[]): void {
  if (sessionIds.length === 0) return;
  try {
    if (!fs.existsSync(RUNTIME_ROOTS_FILE)) return;
    const mappings = JSON.parse(fs.readFileSync(RUNTIME_ROOTS_FILE, 'utf-8')) as Record<string, unknown>;
    let changed = false;
    for (const sessionId of sessionIds) {
      if (Object.prototype.hasOwnProperty.call(mappings, sessionId)) {
        delete mappings[sessionId];
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(RUNTIME_ROOTS_FILE, JSON.stringify(mappings, null, 2));
    }
  } catch {}
}

export interface StateStoreOptions {
  maxEventsPerSession: number;
  sessionMaxAgeMs: number;
  usageRepository?: TokenUsageRepository;
}

export class StateStore {
  private sessions: Map<string, Session> = new Map();
  private options: StateStoreOptions;
  private usageRepository?: TokenUsageRepository;

  constructor(options: StateStoreOptions) {
    this.options = options;
    this.usageRepository = options.usageRepository;
  }

  applyEvent(event: DashboardEvent, options: { throwOnUsageFailure?: boolean } = {}): Session {
    let session = this.sessions.get(event.session_id);

    if (!session) {
      session = this.createSession(event.session_id, event.source, event.timestamp);
      // Lazy start: agents that never emit an explicit SessionStart still get
      // a valid session_start event recorded before their first tool event.
      if (event.event_type !== 'session_start') {
        session.events.unshift({
          id: `${event.session_id}:session-start:inferred`,
          timestamp: event.timestamp,
          source: event.source,
          session_id: event.session_id,
          event_type: 'session_start',
          detail: 'inferred from first event (lazy start)',
          status: 'running',
        });
      }
    }

    session.source = event.source;
    session.last_event_at = Math.max(session.last_event_at, event.timestamp);

    if (event.workspacePath) {
      session.workspaceRoot = event.workspacePath;
      saveSessionRootMapping(event.session_id, event.workspacePath);
    }

    const usageMeasurements = [
      ...(event.token_usage ? [event.token_usage] : []),
      ...(event.token_usages ?? []),
    ];
    for (const measurement of usageMeasurements) {
      if (this.usageRepository && isCodingAgentProduct(event.source)) {
        try {
          const persisted = this.usageRepository.record({
            product: event.source,
            sessionId: event.session_id,
            cursorKey: tokenUsageCursorKey(measurement),
            measurement,
            reportedCostMicrousd: measurement.reportedCostMicrousd,
          });
          if (persisted.status === 'accepted' && persisted.sessionUsage) {
            session.token_usage = hydrateSessionTokenUsage(
              persisted.sessionUsage,
              session.token_usage
            );
          } else if (persisted.status === 'invalid') {
            session.token_usage = rejectMeasurement(session.token_usage);
          }
        } catch (error) {
          if (options.throwOnUsageFailure) throw error;
          console.error('Usage persistence failed; live event retained without token mutation.');
        }
      } else {
        const merged = mergeTokenUsage(session.token_usage, measurement);
        if (merged.accepted) {
          session.token_usage = merged.aggregate;
        } else if (merged.reason === 'invalid') {
          session.token_usage = rejectMeasurement(session.token_usage);
        }
      }
    }

    if (event.event_type === 'session_start' && event.skill) {
      session.active_skill = event.skill;
      session.active_confidence = 'explicit';
    } else if (event.skill) {
      session.active_skill = event.skill;
      session.active_confidence = event.event_type === 'skill_change' ? 'explicit' : 'heuristic';
    } else if (!session.active_skill && event.default_skill) {
      session.active_skill = event.default_skill;
      session.active_confidence = 'heuristic';
    }

    if (!event.skill && session.active_skill) {
      event.skill = session.active_skill;
    }

    session.events.unshift(event);

    if (session.events.length > this.options.maxEventsPerSession) {
      session.events.length = this.options.maxEventsPerSession;
    }

    if (event.tool) {
      session.tool_counts[event.tool] = (session.tool_counts[event.tool] || 0) + 1;
    }

    if (event.event_type === 'session_end') {
      session.ended_at = event.timestamp;
    } else if (event.event_type === 'session_start') {
      // A new SessionStart is the explicit resume signal. Other activity
      // after a terminal event remains historical and cannot revive it.
      session.ended_at = undefined;
    }
    session.lifecycle = deriveLifecycle(event, session);

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

  clearTokenUsage(products: readonly CodingAgentProduct[]): void {
    const selected = new Set(products);
    for (const session of this.sessions.values()) {
      if (isCodingAgentProduct(session.source) && selected.has(session.source)) {
        session.token_usage = createEmptySessionTokenUsage();
      }
    }
  }

  /**
   * Marks sessions with no activity for `idleTimeoutMs` as ended. This is the
   * fallback for agents that die without emitting SessionEnd (e.g. SIGKILL).
   * Returns the sessions that were transitioned so callers can broadcast them.
   */
  markIdleSessionsEnded(idleTimeoutMs: number, now: number = Date.now()): Session[] {
    const ended: Session[] = [];
    for (const session of this.sessions.values()) {
      if (session.lifecycle !== 'ended' && now - session.last_event_at > idleTimeoutMs) {
        session.lifecycle = 'ended';
        session.ended_at = session.last_event_at;
        ended.push(session);
      }
    }
    return ended;
  }

  pruneInactive(now: number = Date.now()): string[] {
    const removed: string[] = [];
    for (const [id, session] of this.sessions) {
      if (now - session.last_event_at > this.options.sessionMaxAgeMs) {
        this.sessions.delete(id);
        removed.push(id);
      }
    }
    removeSessionRootMappings(removed);
    return removed;
  }

  private createSession(id: string, source: AgentSource, startedAt: number): Session {
    const session: Session = {
      id,
      source,
      events: [],
      tool_counts: {},
      token_usage: this.restoreTokenUsage(source, id),
      lifecycle: 'starting',
      started_at: startedAt,
      last_event_at: startedAt,
    };
    const mappings = loadSessionRootMappings();
    if (mappings[id]) {
      session.workspaceRoot = mappings[id];
    }
    this.sessions.set(id, session);
    return session;
  }

  private restoreTokenUsage(source: AgentSource, sessionId: string): SessionTokenUsage {
    if (!this.usageRepository || !isCodingAgentProduct(source)) {
      return createEmptySessionTokenUsage();
    }
    try {
      const usage = this.usageRepository.getSessionUsage(source, sessionId);
      return usage
        ? hydrateSessionTokenUsage(usage, createEmptySessionTokenUsage())
        : createEmptySessionTokenUsage();
    } catch {
      console.error('Usage restoration failed; live session started without token history.');
      return createEmptySessionTokenUsage();
    }
  }
}

function isCodingAgentProduct(source: AgentSource): source is CodingAgentProduct {
  return source !== 'log-watcher';
}

function rejectMeasurement(usage: SessionTokenUsage): SessionTokenUsage {
  return {
    ...usage,
    rejectedMeasurementCount: usage.rejectedMeasurementCount + 1,
  };
}

function hydrateSessionTokenUsage(
  persisted: ClientTokenUsage,
  current: SessionTokenUsage
): SessionTokenUsage {
  return {
    ...current,
    inputTokens: persisted.inputTokens,
    outputTokens: persisted.outputTokens,
    cacheReadTokens: persisted.cacheReadTokens,
    cacheWriteTokens: persisted.cacheWriteTokens,
    reasoningTokens: persisted.reasoningTokens,
    totalTokens: persisted.totalTokens,
    quality: persisted.quality,
    model: persisted.model,
    measurementCount: persisted.measurementCount,
    rejectedMeasurementCount: persisted.rejectedMeasurementCount,
    measuredEventCount: persisted.quality === 'measured' ? persisted.measurementCount : 0,
    estimatedEventCount: persisted.quality === 'estimated' ? persisted.measurementCount : 0,
    cursors: {},
    measurementIds: [],
  };
}

function deriveLifecycle(event: DashboardEvent, session: Session): 'starting' | 'running' | 'ended' {
  if (event.event_type === 'session_start') {
    return 'starting';
  }
  if (event.event_type === 'session_end' || session.ended_at) {
    return 'ended';
  }
  return 'running';
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
