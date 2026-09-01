import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { DashboardEvent, ClientWebSocketMessage } from '../types';
import { StateStore } from '../state';
import { SkillInferenceEngine } from '../skills/infer';
import { sanitizeEventBoundary, sanitizeToolInputPayload, sanitizeToolPayload } from '../filters/sanitize';
import { classifyOperation } from '../lib/operations';
import { createUpdateMessage } from '../presenter';
import { validateTokenUsageMeasurement } from '../telemetry/token-usage';
import { PayloadTooLargeError, readJsonBody } from './json-body';
import { validateDashboardEvent } from '../lib/event-contract';

export interface EventHandlerDependencies {
  state: StateStore;
  inference: SkillInferenceEngine;
  broadcast: (message: ClientWebSocketMessage) => void;
  getActiveSessionId: () => string | undefined;
  setActiveSessionId: (id: string | undefined) => void;
  maxBodyBytes: number;
}

function normalizePathsToRelative(obj: unknown, root: string): unknown {
  if (typeof obj === 'string') {
    const normalizedValue = obj.replace(/\\/g, '/');
    const normalizedRoot = root.replace(/\\/g, '/').replace(/\/+$/, '') || '/';
    const rootPrefix = normalizedRoot === '/' ? '/' : `${normalizedRoot}/`;
    const isInsideRoot = normalizedValue === normalizedRoot
      || normalizedValue.startsWith(rootPrefix);
    if (path.isAbsolute(obj) && isInsideRoot) {
      const rel = path.relative(root, obj);
      return rel.replace(/\\/g, '/');
    }
    if (normalizedRoot !== '/' && normalizedValue.includes(normalizedRoot)) {
      const rootPattern = normalizedRoot;
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
    const res: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      res[key] = normalizePathsToRelative((obj as Record<string, unknown>)[key], root);
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

    if (!validateDashboardEvent(event)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid event' }));
      return;
    }

    if (!sanitizeEventBoundary(event as unknown as Record<string, unknown>)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Event contains unsafe fields' }));
      return;
    }

    const root = event.workspacePath || process.cwd();
    event.input = normalizePathsToRelative(event.input, root) as DashboardEvent['input'];
    event.output = normalizePathsToRelative(event.output, root) as DashboardEvent['output'];
    if (event.detail) {
      event.detail = normalizePathsToRelative(event.detail, root) as string;
    }

    // Defense in depth: events can be POSTed by arbitrary clients, so the
    // payloads are re-sanitized and classified here regardless of the shim.
    event.input = sanitizeToolInputPayload(event.input);
    event.output = sanitizeToolPayload(event.output);
    if (event.token_usage !== undefined) {
      event.token_usage = validateTokenUsageMeasurement(event.token_usage);
    }
    if (event.token_usages !== undefined) {
      event.token_usages = Array.isArray(event.token_usages)
        ? event.token_usages
            .slice(0, 128)
            .map(validateTokenUsageMeasurement)
            .filter((measurement): measurement is NonNullable<typeof measurement> => measurement !== undefined)
        : undefined;
    }
    if (!event.operationType && event.tool) {
      event.operationType = classifyOperation(event.tool);
    }

    const session = deps.state.applyEvent(event);
    const inferred = deps.inference.infer(event, session);

    if (inferred.skill !== session.active_skill || inferred.confidence !== session.active_confidence) {
      deps.state.setActiveSkill(session.id, inferred.skill, inferred.confidence);
    }

    const updatedSession = deps.state.getSession(session.id)!;
    if (updatedSession.lifecycle === 'ended') {
      if (deps.getActiveSessionId() === updatedSession.id) {
        deps.setActiveSessionId(undefined);
      }
    } else {
      deps.setActiveSessionId(updatedSession.id);
    }

    deps.broadcast(createUpdateMessage(updatedSession, deps.getActiveSessionId()));

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  };
}
