import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import WebSocket from 'ws';
import { createDashboardServer } from './server';
import type { ServerConfig } from './types';

function httpGetStatus(port: number, path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path }, (res) => {
      resolve(res.statusCode || 0);
    });
    req.on('error', reject);
    req.end();
  });
}

function getFreePort(): Promise<number> {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function makeConfig(port: number, packageRoot: string): ServerConfig {
  return {
    port,
    host: '127.0.0.1',
    packageRoot,
    maxEventsPerSession: 100,
    sessionMaxAgeMs: 60000,
    pruneIntervalMs: 60000,
  };
}

describe('DashboardServer', () => {
  let server: ReturnType<typeof createDashboardServer>;
  let port: number;

  before(async () => {
    port = await getFreePort();
    server = createDashboardServer(makeConfig(port, process.cwd()));
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  it('serves index.html', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('<html'));
  });

  it('accepts POST /event and broadcasts via WebSocket', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    const snapshot = await new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 2000);
      ws.once('message', (data) => {
        clearTimeout(timer);
        resolve(JSON.parse(data.toString()));
      });
    });

    assert.equal((snapshot as { type: string }).type, 'snapshot');

    const updatePromise = new Promise<unknown>((resolve) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'update') {
          resolve(message);
        }
      });
    });

    const res = await fetch(`http://127.0.0.1:${port}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ev-1',
        timestamp: Date.now(),
        source: 'kimi',
        session_id: 'sess-1',
        event_type: 'tool_start',
        tool: 'Read',
      }),
    });
    assert.equal(res.status, 200);

    const update = await updatePromise;
    assert.equal((update as { session: { id: string } }).session.id, 'sess-1');
    assert.equal((update as { isActive: boolean }).isActive, true);

    ws.close();
  });

  it('rejects events with dangerous fields', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ev-bad',
        timestamp: Date.now(),
        source: 'kimi',
        session_id: 'sess-bad',
        event_type: 'tool_start',
        command: 'rm -rf /',
      }),
    });
    assert.equal(res.status, 400);
  });

  it('blocks static file path traversal', async () => {
    const status = await httpGetStatus(port, '/../../package.json');
    assert.equal(status, 403);
  });
});
