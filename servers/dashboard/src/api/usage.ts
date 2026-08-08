import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AgentSource, ClientWebSocketMessage, DashboardEvent } from '../types';
import { StateStore } from '../state';
import { createUpdateMessage } from '../presenter';
import { normalizeTokenUsage } from '../telemetry/token-usage';
import { sanitizeEventBoundary } from '../filters/sanitize';
import { PayloadTooLargeError, readJsonBody } from './json-body';

const AGENT_SOURCES: ReadonlySet<string> = new Set([
  'kimi',
  'claude',
  'codex',
  'opencode',
  'log-watcher',
  'agy',
]);

const TOKEN_USAGE_ALIASES = {
  input: ['input_tokens', 'inputTokens', 'prompt_tokens', 'promptTokens'],
  output: ['output_tokens', 'outputTokens', 'completion_tokens', 'completionTokens'],
  cacheRead: ['cache_read_input_tokens', 'cacheReadInputTokens', 'cached_tokens', 'cachedTokens'],
  cacheWrite: ['cache_creation_input_tokens', 'cacheWriteInputTokens'],
  reasoning: ['reasoning_tokens', 'reasoningTokens'],
  total: ['total_tokens', 'totalTokens'],
};

export interface UsageHandlerDependencies {
  state: StateStore;
  broadcast: (message: ClientWebSocketMessage) => void;
  getActiveSessionId: () => string | undefined;
  maxBodyBytes: number;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 200;
}

export function createUsageHandler(deps: UsageHandlerDependencies) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    let body: unknown;
    try {
      body = await readJsonBody(req, deps.maxBodyBytes);
    } catch (err) {
      if (err instanceof PayloadTooLargeError) {
        sendJson(res, 413, { error: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
        return;
      }
      sendJson(res, 400, { error: 'Invalid JSON' });
      return;
    }

    if (!isPlainObject(body) || !sanitizeEventBoundary(body)) {
      sendJson(res, 400, { error: 'Invalid request body' });
      return;
    }

    const session_id = typeof body.session_id === 'string' ? body.session_id : undefined;
    if (!session_id) {
      sendJson(res, 400, { error: 'Missing session_id' });
      return;
    }

    const rawSource = typeof body.source === 'string' ? body.source : 'kimi';
    if (!AGENT_SOURCES.has(rawSource)) {
      sendJson(res, 400, { error: 'Invalid source' });
      return;
    }
    const source = rawSource as AgentSource;

    const model = isBoundedString(body.model) ? body.model : undefined;
    const capturedAt = Number.isSafeInteger(body.timestamp) && (body.timestamp as number) >= 0
      ? (body.timestamp as number)
      : Date.now();

    if (!isPlainObject(body.usage)) {
      sendJson(res, 400, { error: 'Missing usage' });
      return;
    }

    const token_usage = normalizeTokenUsage({
      source,
      rawUsage: body.usage,
      model,
      eventId: `${session_id}:ingest:${capturedAt}`,
      capturedAt,
      semantics: 'cumulative',
      aliases: TOKEN_USAGE_ALIASES,
    });

    if (!token_usage) {
      sendJson(res, 400, { error: 'Invalid usage' });
      return;
    }

    const event: DashboardEvent = {
      id: generateId(),
      timestamp: Date.now(),
      source,
      session_id,
      event_type: 'skill_change',
      token_usage,
    };

    const session = deps.state.applyEvent(event);
    deps.broadcast(createUpdateMessage(session, deps.getActiveSessionId()));

    sendJson(res, 200, { ok: true });
  };
}
