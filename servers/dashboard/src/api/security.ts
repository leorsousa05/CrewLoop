import type { IncomingMessage, ServerResponse } from 'node:http';
import type { StateStore } from '../state';
import type { ClientWebSocketMessage } from '../types';
import { createUpdateMessage } from '../presenter';
import { PayloadTooLargeError, readJsonBody } from './json-body';

export interface SecurityHandlerDependencies {
  state: StateStore;
  maxBodyBytes: number;
  broadcast?: (message: ClientWebSocketMessage) => void;
  getActiveSessionId?: () => string | undefined;
}

interface ConfirmationRoute {
  id: string;
  action?: 'approve' | 'deny';
}

function parseConfirmationRoute(pathname: string): ConfirmationRoute | undefined {
  const match = pathname.match(/^\/api\/security\/confirmations\/([^/]+)(?:\/(approve|deny))?$/);
  if (!match) return undefined;
  return {
    id: match[1],
    action: match[2] as 'approve' | 'deny' | undefined,
  };
}

function readRemember(body: unknown): boolean | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  if (!('remember' in body)) return undefined;
  return Boolean((body as Record<string, unknown>).remember);
}

export function createSecurityHandler(deps: SecurityHandlerDependencies) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const sessionId = parsedUrl.searchParams.get('sessionId') || undefined;

    if (pathname === '/api/security') {
      if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      if (!sessionId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing sessionId parameter' }));
        return;
      }

      const session = deps.state.getSession(sessionId);
      if (!session) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          decisions: session.security_decisions,
          pendingConfirmations: session.pending_confirmations,
        })
      );
      return;
    }

    const route = parseConfirmationRoute(pathname);
    if (!route) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    if (req.method === 'GET' && !route.action) {
      const confirmation = deps.state.getConfirmation(route.id);
      if (!confirmation) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Confirmation not found' }));
        return;
      }

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: confirmation.status,
          remember: confirmation.remember,
        })
      );
      return;
    }

    if (req.method === 'POST' && route.action) {
      let body: unknown;
      try {
        body = await readJsonBody(req, deps.maxBodyBytes);
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

      const remember = readRemember(body);
      const confirmation =
        route.action === 'approve'
          ? deps.state.approveConfirmation(route.id, remember)
          : deps.state.denyConfirmation(route.id, remember);

      if (!confirmation) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Confirmation not found' }));
        return;
      }

      // Broadcast updated session so the UI refreshes via WebSocket.
      if (deps.broadcast) {
        const session = deps.state.getSession(confirmation.session_id);
        if (session) {
          deps.broadcast(createUpdateMessage(session, deps.getActiveSessionId?.()));
        }
      }

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: confirmation.status,
          remember: confirmation.remember,
        })
      );
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  };
}
