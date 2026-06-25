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
import { createSnapshotMessage } from './presenter';

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
    state.pruneInactive();
  }, config.pruneIntervalMs);

  function serveStaticFile(
    res: http.ServerResponse,
    filePath: string,
    contentType: string
  ): void {
    const publicDir = path.resolve(__dirname, '..', 'public');
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
