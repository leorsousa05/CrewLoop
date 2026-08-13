import type { IncomingMessage, ServerResponse } from 'node:http';
import type { CodingAgentProduct } from '../types';
import type { StateStore } from '../state';
import {
  CODING_AGENT_PRODUCTS,
  type TokenUsageRepository,
} from '../telemetry/usage-repository';
import { PayloadTooLargeError, readJsonBody } from './json-body';

export function createResetUsageHandler(deps: {
  repository: TokenUsageRepository;
  state: StateStore;
  maxBodyBytes: number;
}) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    let body: unknown;
    try {
      body = await readJsonBody(req, deps.maxBodyBytes);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        sendJson(res, 413, { error: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
      } else {
        sendJson(res, 400, { error: 'Invalid JSON' });
      }
      return;
    }
    if (!isPlainObject(body) || body.confirmation !== 'RESET') {
      sendJson(res, 400, { error: 'Exact RESET confirmation required', code: 'RESET_CONFIRMATION_REQUIRED' });
      return;
    }
    const products = parseProducts(body.products);
    if (body.products !== undefined && !products) {
      sendJson(res, 400, { error: 'Invalid products', code: 'INVALID_PRODUCTS' });
      return;
    }
    const selected = products ?? [...CODING_AGENT_PRODUCTS];
    try {
      const result = deps.repository.reset(selected);
      deps.state.clearTokenUsage(selected);
      sendJson(res, 200, { ok: true, ...result });
    } catch {
      sendJson(res, 503, { error: 'Usage reset unavailable', code: 'USAGE_RESET_FAILED' });
    }
  };
}

function parseProducts(value: unknown): CodingAgentProduct[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const products = [...new Set(value)];
  if (products.some(
    (product) => typeof product !== 'string'
      || !CODING_AGENT_PRODUCTS.includes(product as CodingAgentProduct)
  )) return undefined;
  return products as CodingAgentProduct[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}
