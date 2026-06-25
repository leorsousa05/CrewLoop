import type { IncomingMessage, ServerResponse } from 'node:http';
import type { DashboardEvent, ClientWebSocketMessage } from '../types';
import { StateStore } from '../state';
import { SkillInferenceEngine } from '../skills/infer';
import { sanitizeEventBoundary } from '../filters/sanitize';
import { createUpdateMessage } from '../presenter';

export interface EventHandlerDependencies {
  state: StateStore;
  inference: SkillInferenceEngine;
  broadcast: (message: ClientWebSocketMessage) => void;
  getActiveSessionId: () => string | undefined;
  setActiveSessionId: (id: string) => void;
}

export function createEventHandler(deps: EventHandlerDependencies) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
    });

    await new Promise<void>((resolve) => {
      req.on('end', resolve);
    });

    let event: DashboardEvent;
    try {
      event = JSON.parse(body) as DashboardEvent;
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    if (!sanitizeEventBoundary(event as unknown as Record<string, unknown>)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Event contains unsafe fields' }));
      return;
    }

    if (!event.session_id || !event.event_type) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    const session = deps.state.applyEvent(event);
    const inferred = deps.inference.infer(event, session);

    if (inferred.confidence === 'explicit') {
      deps.state.setActiveSkill(session.id, inferred.skill, inferred.confidence);
    } else if (!event.default_skill && inferred.skill) {
      // Only apply heuristic tool-to-skill mapping when the source did not
      // declare a default skill. This keeps AGY sessions on the default skill
      // until an explicit skill signal arrives.
      deps.state.setActiveSkill(session.id, inferred.skill, inferred.confidence);
    }

    const updatedSession = deps.state.getSession(session.id)!;
    deps.setActiveSessionId(updatedSession.id);

    deps.broadcast(createUpdateMessage(updatedSession, deps.getActiveSessionId()));

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  };
}
