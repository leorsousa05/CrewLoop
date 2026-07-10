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
import { resolvePath } from './lib/paths';

function getSessionActivePaths(session: any, root: string): Set<string> {
  const paths = new Set<string>();
  if (!session || !Array.isArray(session.events)) return paths;
  for (const event of session.events) {
    const p = resolvePath(event.input, event.output);
    if (p) {
      paths.add(path.resolve(root, p));
    }
  }
  return paths;
}

function inferWorkspaceRoot(session: any): string | undefined {
  if (!session || !Array.isArray(session.events)) return undefined;
  
  const absPathRegex = /(?:\/home\/[a-zA-Z0-9_-]+|\/[a-zA-Z0-9_-]+|[a-zA-Z]:)\/[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*/g;

  for (const event of session.events) {
    const searchStrings: string[] = [];
    if (typeof event.detail === 'string') searchStrings.push(event.detail);
    if (event.input) searchStrings.push(JSON.stringify(event.input));
    if (event.output) searchStrings.push(JSON.stringify(event.output));

    for (const str of searchStrings) {
      let match;
      while ((match = absPathRegex.exec(str)) !== null) {
        const fullPath = match[0];
        let current = path.dirname(fullPath);
        let foundPackageJson: string | undefined;
        while (current && current !== '/' && current !== '.' && path.dirname(current) !== current) {
          if (fs.existsSync(path.join(current, '.git'))) {
            return current;
          }
          if (fs.existsSync(path.join(current, 'package.json')) && !foundPackageJson) {
            foundPackageJson = current;
          }
          current = path.dirname(current);
        }
        if (foundPackageJson) {
          return foundPackageJson;
        }
      }
    }
  }
  return undefined;
}

let repoRootCache: string | undefined;
function getRepoRoot(): string {
  if (repoRootCache) return repoRootCache;
  let current = process.cwd();
  while (current && current !== '/' && current !== '.' && path.dirname(current) !== current) {
    if (fs.existsSync(path.join(current, '.git'))) {
      repoRootCache = current;
      return current;
    }
    current = path.dirname(current);
  }
  repoRootCache = process.cwd();
  return repoRootCache;
}

function getSessionWorkspaceRoot(sessionId: string | null, state: StateStore): string | undefined {
  if (!sessionId) return undefined;
  const session = state.getSession(sessionId);
  if (session?.workspaceRoot) return session.workspaceRoot;

  try {
    const RUNTIME_ROOTS_FILE = path.join(require('node:os').tmpdir(), 'crewloop-session-roots.json');
    if (fs.existsSync(RUNTIME_ROOTS_FILE)) {
      const mappings = JSON.parse(fs.readFileSync(RUNTIME_ROOTS_FILE, 'utf-8'));
      if (mappings[sessionId]) return mappings[sessionId];
    }
  } catch {}
  return undefined;
}

export interface DashboardServer {
  httpServer: http.Server;
  wss: WebSocketServer;
  state: StateStore;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function listWorkspaceFiles(dir: string, baseDir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const name = entry.name;
      if (
        name === '.git' ||
        name === 'node_modules' ||
        name === 'dist' ||
        name === '.next' ||
        name === 'build' ||
        name === 'coverage' ||
        name === '.gemini' ||
        name === 'out' ||
        name === '.system_generated' ||
        name === '.DS_Store'
      ) {
        continue;
      }
      const fullPath = path.join(dir, name);
      if (entry.isDirectory()) {
        results.push(...listWorkspaceFiles(fullPath, baseDir));
      } else {
        results.push(path.relative(baseDir, fullPath));
      }
    }
  } catch {
    // Fail silently on read errors (permissions, etc.)
  }
  return results;
}

export function createDashboardServer(config: ServerConfig): DashboardServer {
  const state = new StateStore({
    maxEventsPerSession: config.maxEventsPerSession,
    sessionMaxAgeMs: config.sessionMaxAgeMs,
  });

  const registry = new SkillRegistry(config.packageRoot);
  registry.load();

  const inference = new SkillInferenceEngine(registry.getSkills());
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
  });
  const skillsHandler = createSkillsHandler(registry);

  const httpServer = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

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
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const sessionId = parsedUrl.searchParams.get('sessionId');
        const session = sessionId ? state.getSession(sessionId) : undefined;
        const root = getSessionWorkspaceRoot(sessionId, state) || inferWorkspaceRoot(session) || getRepoRoot();
        const files = listWorkspaceFiles(root, root);
        res.end(JSON.stringify(files));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/file-content')) {
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const relPath = parsedUrl.searchParams.get('path');
        const sessionId = parsedUrl.searchParams.get('sessionId');
        if (!relPath) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing path parameter' }));
          return;
        }
        const session = sessionId ? state.getSession(sessionId) : undefined;
        let root = getSessionWorkspaceRoot(sessionId, state) || inferWorkspaceRoot(session);
        if (!root) {
          const repoRoot = getRepoRoot();
          if (fs.existsSync(path.resolve(repoRoot, relPath))) {
            root = repoRoot;
          } else {
            root = process.cwd();
          }
        }
        const absPath = path.resolve(root, relPath);
        
        console.log(`[FILE-CONTENT] Request - Path: "${relPath}", SessionId: "${sessionId}", SessionFound: ${!!session}, ResolvedRoot: "${root}", AbsPath: "${absPath}"`);

        let isAllowed = absPath.startsWith(root);
        if (!isAllowed) {
          if (sessionId && absPath.includes(sessionId)) {
            isAllowed = true;
          } else if (session) {
            const allowed = getSessionActivePaths(session, root);
            console.log(`[FILE-CONTENT] Out of root traversal. Checking allowed active paths:`, Array.from(allowed));
            if (allowed.has(absPath)) {
              isAllowed = true;
            }
          }
        }
        console.log(`[FILE-CONTENT] Allowed: ${isAllowed}, FileExists: ${fs.existsSync(absPath)}`);

        if (!isAllowed) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'Forbidden' }));
          return;
        }
        if (!fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }
        const content = fs.readFileSync(absPath, 'utf-8');
        if (content.includes('\0')) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Binary files not supported' }));
          return;
        }
        res.end(JSON.stringify({ content }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/file-diff')) {
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const relPath = parsedUrl.searchParams.get('path');
        const sessionId = parsedUrl.searchParams.get('sessionId');
        if (!relPath) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing path parameter' }));
          return;
        }
        const session = sessionId ? state.getSession(sessionId) : undefined;
        let root = getSessionWorkspaceRoot(sessionId, state) || inferWorkspaceRoot(session);
        if (!root) {
          const repoRoot = getRepoRoot();
          if (fs.existsSync(path.resolve(repoRoot, relPath))) {
            root = repoRoot;
          } else {
            root = process.cwd();
          }
        }
        const absPath = path.resolve(root, relPath);
        
        console.log(`[FILE-DIFF] Request - Path: "${relPath}", SessionId: "${sessionId}", SessionFound: ${!!session}, ResolvedRoot: "${root}", AbsPath: "${absPath}"`);

        let isAllowed = absPath.startsWith(root);
        if (!isAllowed) {
          if (sessionId && absPath.includes(sessionId)) {
            isAllowed = true;
          } else if (session) {
            const allowed = getSessionActivePaths(session, root);
            console.log(`[FILE-DIFF] Out of root traversal. Checking allowed active paths:`, Array.from(allowed));
            if (allowed.has(absPath)) {
              isAllowed = true;
            }
          }
        }
        console.log(`[FILE-DIFF] Allowed: ${isAllowed}, FileExists: ${fs.existsSync(absPath)}`);

        if (!isAllowed) {
          res.statusCode = 403;
          res.end(JSON.stringify({ error: 'Forbidden' }));
          return;
        }

        const { execFile } = require('node:child_process');
        execFile('git', ['diff', 'HEAD', '--', absPath], { cwd: root }, (error: any, stdout: string, stderr: string) => {
          if (error && error.code !== 1) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Git diff failed', detail: stderr }));
            return;
          }

          if (!stdout && fs.existsSync(absPath) && !fs.statSync(absPath).isDirectory()) {
            execFile('git', ['status', '--porcelain', absPath], { cwd: root }, (statusErr: any, statusOut: string) => {
              if (statusOut && statusOut.trim().startsWith('??')) {
                try {
                  const content = fs.readFileSync(absPath, 'utf-8');
                  if (content.includes('\0')) {
                    res.end(JSON.stringify({ diff: '' }));
                    return;
                  }
                  const simulatedDiff = content.split('\n').map(l => '+' + l).join('\n');
                  res.end(JSON.stringify({ diff: simulatedDiff }));
                } catch {
                  res.end(JSON.stringify({ diff: '' }));
                }
              } else {
                res.end(JSON.stringify({ diff: '' }));
              }
            });
            return;
          }

          res.end(JSON.stringify({ diff: stdout || '' }));
        });
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
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

  const wss = new WebSocketServer({ server: httpServer });

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
