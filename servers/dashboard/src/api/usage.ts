import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import type { CodingAgentProduct, ClientWebSocketMessage, DashboardEvent } from '../types';
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

// Reject timestamps beyond year 2100 to bound far-future cursor/dedup keys.
const MAX_INGEST_TIMESTAMP = 4_102_444_800_000;

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
    if (!session_id || !isBoundedString(session_id)) {
      sendJson(res, 400, { error: 'Missing session_id' });
      return;
    }

    const rawSource = typeof body.source === 'string' ? body.source : 'kimi';
    if (!AGENT_SOURCES.has(rawSource)) {
      sendJson(res, 400, { error: 'Invalid source' });
      return;
    }
    const source = rawSource as CodingAgentProduct;

    const model = isBoundedString(body.model) ? body.model : undefined;
    const capturedAt = Number.isSafeInteger(body.timestamp) && (body.timestamp as number) >= 0
      ? (body.timestamp as number)
      : Date.now();

    const providedMeasurementId = body.measurement_id === undefined
      ? undefined
      : isBoundedString(body.measurement_id)
        ? body.measurement_id
        : null;
    if (providedMeasurementId === null) {
      sendJson(res, 400, { error: 'Invalid measurement_id' });
      return;
    }
    const semantics = body.semantics === undefined ? 'cumulative' : body.semantics;
    if (semantics !== 'delta' && semantics !== 'cumulative') {
      sendJson(res, 400, { error: 'Invalid semantics' });
      return;
    }
    let reportedCostMicrousd: number | undefined;
    if (body.cost_usd !== undefined) {
      if (typeof body.cost_usd !== 'number' || !Number.isFinite(body.cost_usd) || body.cost_usd < 0) {
        sendJson(res, 400, { error: 'Invalid cost_usd' });
        return;
      }
      reportedCostMicrousd = Math.round(body.cost_usd * 1_000_000);
      if (!Number.isSafeInteger(reportedCostMicrousd)) {
        sendJson(res, 400, { error: 'Invalid cost_usd' });
        return;
      }
    }

    if (!isPlainObject(body.usage)) {
      sendJson(res, 400, { error: 'Missing usage' });
      return;
    }

    if (
      semantics === 'delta'
      && providedMeasurementId === undefined
      && !(Number.isSafeInteger(body.timestamp) && (body.timestamp as number) >= 0)
    ) {
      sendJson(res, 400, {
        error: 'Delta usage requires a stable measurement_id or timestamp',
        code: 'STABLE_MEASUREMENT_ID_REQUIRED',
      });
      return;
    }

    if (
      body.coverage !== undefined
      && body.coverage !== 'complete'
      && body.coverage !== 'partial'
    ) {
      sendJson(res, 400, { error: 'Invalid coverage' });
      return;
    }
    if (Number.isSafeInteger(body.timestamp) && (body.timestamp as number) > MAX_INGEST_TIMESTAMP) {
      sendJson(res, 400, { error: 'Invalid timestamp' });
      return;
    }

    const normalized = normalizeTokenUsage({
      source,
      rawUsage: body.usage,
      model,
      eventId: providedMeasurementId ?? 'pending-ingest-identity',
      capturedAt,
      semantics,
      aliases: TOKEN_USAGE_ALIASES,
      cursorKey: `${source}:external`,
      reportedCostMicrousd,
      coverage: body.coverage === 'partial' ? 'partial' : 'complete',
    });

    if (!normalized) {
      sendJson(res, 400, { error: 'Invalid usage' });
      return;
    }
    const measurementId = providedMeasurementId ?? stableIngestMeasurementId({
      source,
      sessionId: session_id,
      model,
      semantics,
      timestamp: Number.isSafeInteger(body.timestamp) ? body.timestamp as number : undefined,
      counts: normalized,
    });
    const token_usage = { ...normalized, measurementId };

    const event: DashboardEvent = {
      id: generateId(),
      timestamp: Date.now(),
      source,
      session_id,
      event_type: 'skill_change',
      token_usage,
    };

    let session;
    try {
      session = deps.state.applyEvent(event, { throwOnUsageFailure: true });
    } catch {
      sendJson(res, 503, { error: 'Usage persistence unavailable', code: 'USAGE_WRITE_FAILED' });
      return;
    }
    deps.broadcast(createUpdateMessage(session, deps.getActiveSessionId()));

    sendJson(res, 200, { ok: true });
  };
}

function stableIngestMeasurementId(input: {
  source: CodingAgentProduct;
  sessionId: string;
  model?: string;
  semantics: 'delta' | 'cumulative';
  timestamp?: number;
  counts: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    reasoningTokens: number;
    totalTokens: number;
  };
}): string {
  const identity = [
    input.source,
    input.sessionId,
    input.model ?? '',
    input.semantics,
    input.timestamp ?? '',
    input.counts.inputTokens,
    input.counts.outputTokens,
    input.counts.cacheReadTokens,
    input.counts.cacheWriteTokens,
    input.counts.reasoningTokens,
    input.counts.totalTokens,
  ];
  const digest = createHash('sha256').update(JSON.stringify(identity)).digest('hex').slice(0, 32);
  return `ingest:${digest}`;
}
