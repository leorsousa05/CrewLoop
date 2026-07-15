import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import type { ServerConfig, ClientWebSocketMessage } from './types';
import { StateStore } from './state';
import { SkillRegistry } from './skills/registry';
import { SkillInferenceEngine } from './skills/infer';
import { createEventHandler } from './api/event';
import { createSkillsHandler } from './api/skills';
import { createSnapshotMessage, createUpdateMessage } from './presenter';
import { createLocalRequestPolicy } from './lib/local-request-policy';
import {
  resolveContainedPath,
  readTextFile,
  listWorkspaceFiles,
  WorkspaceAccessError,
} from './lib/workspace-access';

function getSessionWorkspaceRoot(sessionId: string | null, state: StateStore): string | undefined {
  if (!sessionId) return undefined;
  const session = state.getSession(sessionId);
  if (session?.workspaceRoot) return session.workspaceRoot;

  try {
    const RUNTIME_ROOTS_FILE = path.join(require('node:os').tmpdir(), 'crewloop-session-roots.json');
    if (fs.existsSync(RUNTIME_ROOTS_FILE)) {
      const mappings = JSON.parse(fs.readFileSync(RUNTIME_ROOTS_FILE, 'utf-8'));
      if (typeof mappings[sessionId] === 'string') return mappings[sessionId];
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function sendJsonError(
  res: http.ServerResponse,
  status: number,
  error: string,
  code?: string
): void {
  res.statusCode = status;
  res.end(JSON.stringify(code ? { error, code } : { error }));
}

function statusForAccessError(err: WorkspaceAccessError): number {
  switch (err.code) {
    case 'PATH_FORBIDDEN':
      return 403;
    case 'FILE_TOO_LARGE':
    case 'BINARY_FILE_UNSUPPORTED':
    case 'WORKSPACE_LIMIT_EXCEEDED':
      return 413;
    default:
      return 404;
  }
}

export interface DashboardServer {
  httpServer: http.Server;
  wss: WebSocketServer;
  state: StateStore;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function createDashboardServer(config: ServerConfig): DashboardServer {
  const state = new StateStore({
    maxEventsPerSession: config.maxEventsPerSession,
    sessionMaxAgeMs: config.sessionMaxAgeMs,
  });

  const registry = new SkillRegistry(config.packageRoot);
  registry.load();

  const inference = new SkillInferenceEngine(registry.getSkills());
  const requestPolicy = createLocalRequestPolicy({ host: config.host, port: config.port });
  const workspaceLimits = {
    fileBytes: config.fileBytes,
    workspaceEntries: config.workspaceEntries,
    workspaceDepth: config.workspaceDepth,
  };
  const clients = new Set<WebSocket>();
  let activeSessionId: string | undefined;

  function broadcast(message: ClientWebSocketMessage): void {
    const data = JSON.stringify(message);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  function sendSnapshot(client: WebSocket): void {
    const message = createSnapshotMessage(state.getAllSessions());
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  const eventHandler = createEventHandler({
    state,
    inference,
    broadcast,
    getActiveSessionId: () => activeSessionId,
    setActiveSessionId: (id: string) => {
      activeSessionId = id;
    },
    maxBodyBytes: config.eventBodyBytes,
  });
  const skillsHandler = createSkillsHandler(registry);

  const httpServer = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    const isSensitiveRoute =
      req.url === '/event' ||
      req.url === '/api/skills' ||
      req.url?.startsWith('/api/workspace-files') ||
      req.url?.startsWith('/api/file-content') ||
      req.url?.startsWith('/api/file-diff');
    if (isSensitiveRoute && !requestPolicy.acceptsHost(req.headers.host)) {
      sendJsonError(res, 403, 'Forbidden', 'INVALID_LOCAL_HOST');
      return;
    }

    if (req.method === 'POST' && req.url === '/event') {
      eventHandler(req, res).catch((err) => {
        console.error('Event handler error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error' }));
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/api/skills') {
      skillsHandler(req, res).catch((err) => {
        console.error('Skills handler error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error' }));
      });
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/workspace-files')) {
      (async () => {
        const parsedUrl = new URL(req.url!, `http://${req.headers.host || 'localhost'}`);
        const sessionId = parsedUrl.searchParams.get('sessionId');
        const root = getSessionWorkspaceRoot(sessionId, state);
        if (!root) {
          sendJsonError(res, 404, 'Workspace unavailable', 'WORKSPACE_UNAVAILABLE');
          return;
        }
        const files = await listWorkspaceFiles(root, workspaceLimits);
        res.end(JSON.stringify(files));
      })().catch((err) => {
        if (err instanceof WorkspaceAccessError) {
          sendJsonError(res, statusForAccessError(err), err.message, err.code);
          return;
        }
        sendJsonError(res, 500, 'Failed to list workspace files');
      });
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/file-content')) {
      (async () => {
        const parsedUrl = new URL(req.url!, `http://${req.headers.host || 'localhost'}`);
        const relPath = parsedUrl.searchParams.get('path');
        const sessionId = parsedUrl.searchParams.get('sessionId');
        if (!relPath) {
          sendJsonError(res, 400, 'Missing path parameter');
          return;
        }
        const root = getSessionWorkspaceRoot(sessionId, state);
        if (!root) {
          sendJsonError(res, 404, 'Workspace unavailable', 'WORKSPACE_UNAVAILABLE');
          return;
        }
        const absPath = await resolveContainedPath(root, relPath);
        const content = await readTextFile(absPath, workspaceLimits.fileBytes);
        res.end(JSON.stringify({ content }));
      })().catch((err) => {
        if (err instanceof WorkspaceAccessError) {
          sendJsonError(res, statusForAccessError(err), err.message, err.code);
          return;
        }
        sendJsonError(res, 500, 'Failed to read file');
      });
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/file-diff')) {
      (async () => {
        const parsedUrl = new URL(req.url!, `http://${req.headers.host || 'localhost'}`);
        const relPath = parsedUrl.searchParams.get('path');
        const sessionId = parsedUrl.searchParams.get('sessionId');
        if (!relPath) {
          sendJsonError(res, 400, 'Missing path parameter');
          return;
        }
        const root = getSessionWorkspaceRoot(sessionId, state);
        if (!root) {
          sendJsonError(res, 404, 'Workspace unavailable', 'WORKSPACE_UNAVAILABLE');
          return;
        }
        const absPath = await resolveContainedPath(root, relPath);

        const { execFile } = require('node:child_process');
        execFile('git', ['diff', 'HEAD', '--', absPath], { cwd: root }, (error: any, stdout: string, stderr: string) => {
          if (error && error.code !== 1) {
            sendJsonError(res, 500, 'Git diff failed');
            return;
          }

          if (!stdout && fs.existsSync(absPath) && !fs.statSync(absPath).isDirectory()) {
            execFile('git', ['status', '--porcelain', absPath], { cwd: root }, (statusErr: any, statusOut: string) => {
              if (statusOut && statusOut.trim().startsWith('??')) {
                readTextFile(absPath, workspaceLimits.fileBytes)
                  .then((content) => {
                    const simulatedDiff = content.split('\n').map((l) => '+' + l).join('\n');
                    res.end(JSON.stringify({ diff: simulatedDiff }));
                  })
                  .catch(() => {
                    res.end(JSON.stringify({ diff: '' }));
                  });
                return;
              }
              res.end(JSON.stringify({ diff: '' }));
            });
            return;
          }

          res.end(JSON.stringify({ diff: stdout || '' }));
        });
      })().catch((err) => {
        if (err instanceof WorkspaceAccessError) {
          sendJsonError(res, statusForAccessError(err), err.message, err.code);
          return;
        }
        sendJsonError(res, 500, 'Failed to load diff');
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/') {
      serveStaticFile(res, 'index.html', 'text/html');
      return;
    }

    if (req.method === 'GET') {
      const filePath = req.url?.slice(1) || '';
      const ext = path.extname(filePath);
      const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
      serveStaticFile(res, filePath, contentType);
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  const wss = new WebSocketServer({
    server: httpServer,
    verifyClient: (info: { origin?: string; secure: boolean; req: http.IncomingMessage }, done: (verified: boolean, code?: number, message?: string) => void) => {
      if (!requestPolicy.acceptsWebSocketOrigin(info.origin)) {
        done(false, 403, 'Forbidden');
        return;
      }
      done(true);
    },
  });

  wss.on('connection', (client) => {
    clients.add(client);
    sendSnapshot(client);

    client.on('message', (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as { type?: string };
        if (message.type === 'ping') {
          client.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {
        // Ignore malformed client messages.
      }
    });

    client.on('close', () => {
      clients.delete(client);
    });
  });

  const pruneInterval = setInterval(() => {
    // Fallback SessionEnd for agents killed without emitting one (e.g. SIGKILL).
    const endedSessions = state.markIdleSessionsEnded(config.sessionIdleTimeoutMs);
    for (const session of endedSessions) {
      broadcast(createUpdateMessage(session, activeSessionId));
    }
    state.pruneInactive();
  }, config.pruneIntervalMs);

  function serveStaticFile(
    res: http.ServerResponse,
    filePath: string,
    contentType: string
  ): void {
    const publicDir = path.resolve(__dirname, '..', 'dist', 'public');
    const fullPath = path.resolve(publicDir, filePath);
    if (!fullPath.startsWith(publicDir + path.sep)) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }

    if (!fs.existsSync(fullPath)) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Failed to read file' }));
        return;
      }
      res.setHeader('Content-Type', contentType);
      res.statusCode = 200;
      res.end(data);
    });
  }

  function formatListenError(err: NodeJS.ErrnoException): Error {
    if (err.code === 'EADDRINUSE') {
      return new Error(`Port ${config.port} is already in use. Use --port <number> to choose another port.`);
    }
    if (err.code === 'EACCES') {
      return new Error(`Permission denied to use port ${config.port}. Try a port above 1024 or use --port <number>.`);
    }
    return new Error(`Failed to start dashboard server: ${err.message}`);
  }

  return {
    httpServer,
    wss,
    state,
    start: () =>
      new Promise<void>((resolve, reject) => {
        const onError = (err: Error) => {
          httpServer.off('error', onError);
          wss.off('error', onError);
          reject(formatListenError(err as NodeJS.ErrnoException));
        };

        httpServer.once('error', onError);
        wss.once('error', onError);

        httpServer.listen(config.port, config.host, () => {
          httpServer.off('error', onError);
          wss.off('error', onError);
          const uiIndex = path.resolve(__dirname, '..', 'dist', 'public', 'index.html');
          if (!fs.existsSync(uiIndex)) {
            console.warn('Warning: built UI not found at dist/public/index.html. Run `npm run build` first.');
          }
          console.log(`CrewLoop dashboard running at http://${config.host}:${config.port}`);
          resolve();
        });
      }),
    stop: () =>
      new Promise<void>((resolve) => {
        clearInterval(pruneInterval);
        for (const client of clients) {
          client.terminate();
        }
        wss.close(() => {
          httpServer.close(() => {
            resolve();
          });
        });
      }),
  };
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};
