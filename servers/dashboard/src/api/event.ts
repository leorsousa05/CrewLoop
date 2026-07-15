import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { DashboardEvent, ClientWebSocketMessage } from '../types';
import { StateStore } from '../state';
import { SkillInferenceEngine } from '../skills/infer';
import { sanitizeEventBoundary, sanitizeToolPayload } from '../filters/sanitize';
import { classifyOperation } from '../lib/operations';
import { createUpdateMessage } from '../presenter';

export interface EventHandlerDependencies {
  state: StateStore;
  inference: SkillInferenceEngine;
  broadcast: (message: ClientWebSocketMessage) => void;
  getActiveSessionId: () => string | undefined;
  setActiveSessionId: (id: string) => void;
  maxBodyBytes: number;
}

class PayloadTooLargeError extends Error {
  constructor() {
    super('Payload too large');
    this.name = 'PayloadTooLargeError';
  }
}

function readJsonBody(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    let tooLarge = false;
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > maxBytes) {
        tooLarge = true;
        body = '';
        return;
      }
      if (!tooLarge) body += chunk;
    });
    req.on('end', () => {
      if (tooLarge) {
        reject(new PayloadTooLargeError());
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function normalizePathsToRelative(obj: any, root: string): any {
  if (typeof obj === 'string') {
    if (path.isAbsolute(obj) && obj.startsWith(root)) {
      let rel = path.relative(root, obj);
      return rel.replace(/\\/g, '/');
    }
    if (obj.includes(root)) {
      const rootPattern = root.replace(/\\/g, '/');
      const escapedRoot = rootPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedRoot + '[/\\\\]?', 'g');
      return obj.replace(regex, '');
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => normalizePathsToRelative(item, root));
  }
  if (typeof obj === 'object' && obj !== null) {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = normalizePathsToRelative(obj[key], root);
    }
    return res;
  }
  return obj;
}

export function createEventHandler(deps: EventHandlerDependencies) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let event: DashboardEvent;
    try {
      event = (await readJsonBody(req, deps.maxBodyBytes)) as DashboardEvent;
    } catch (err) {
      if (err instanceof PayloadTooLargeError) {
        res.statusCode = 413;
        res.end(JSON.stringify({ error: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' }));
        return;
      }
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

    const root = event.workspacePath || process.cwd();
    const workspacePath = event.workspacePath;
    event = normalizePathsToRelative(event, root) as DashboardEvent;
    event.workspacePath = workspacePath;

    // Defense in depth: events can be POSTed by arbitrary clients, so the
    // payloads are re-sanitized and classified here regardless of the shim.
    event.input = sanitizeToolPayload(event.input);
    event.output = sanitizeToolPayload(event.output);
    if (!event.operationType && event.tool) {
      event.operationType = classifyOperation(event.tool);
    }

    const session = deps.state.applyEvent(event);
    const inferred = deps.inference.infer(event, session);

    if (inferred.skill !== session.active_skill || inferred.confidence !== session.active_confidence) {
      deps.state.setActiveSkill(session.id, inferred.skill, inferred.confidence);
    }

    const updatedSession = deps.state.getSession(session.id)!;
    deps.setActiveSessionId(updatedSession.id);

    deps.broadcast(createUpdateMessage(updatedSession, deps.getActiveSessionId()));

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  };
}
