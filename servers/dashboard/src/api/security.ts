import type { IncomingMessage, ServerResponse } from 'node:http';
import type { StateStore } from '../state';

export interface SecurityHandlerDependencies {
  state: StateStore;
}

export function createSecurityHandler(deps: SecurityHandlerDependencies) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const sessionId = parsedUrl.searchParams.get('sessionId');
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
      })
    );
  };
}
