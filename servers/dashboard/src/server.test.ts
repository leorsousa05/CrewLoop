import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
    sessionIdleTimeoutMs: 60000,
    pruneIntervalMs: 60000,
    eventBodyBytes: 64 * 1024,
    fileBytes: 1024 * 1024,
    workspaceEntries: 5000,
    workspaceDepth: 20,
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

  it('reports a friendly error when the port is already in use', async () => {
    const secondServer = createDashboardServer(makeConfig(port, process.cwd()));
    await assert.rejects(secondServer.start(), /already in use/);
    await secondServer.stop();
  });

  it('rejects WebSocket connections from foreign origins', async () => {
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
        headers: { Origin: 'http://evil.example.com' },
      });
      ws.once('open', () => {
        ws.close();
        reject(new Error('connection should have been rejected'));
      });
      ws.once('error', () => resolve());
    });
  });

  it('accepts WebSocket connections from local origins', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
      headers: { Origin: `http://127.0.0.1:${port}` },
    });
    const snapshot = await new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 2000);
      ws.once('message', (data) => {
        clearTimeout(timer);
        resolve(JSON.parse(data.toString()));
      });
    });
    assert.equal((snapshot as { type: string }).type, 'snapshot');
    ws.close();
  });

  it('rejects sensitive REST routes with a foreign Host header', async () => {
    const status = await new Promise<number>((resolve, reject) => {
      const req = http.get(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/workspace-files?sessionId=sess-1',
          headers: { Host: 'evil.example.com' },
        },
        (res) => resolve(res.statusCode || 0)
      );
      req.on('error', reject);
      req.end();
    });
    assert.equal(status, 403);
  });

  it('rejects event posts with a foreign Host header', async () => {
    const status = await new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/event',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Host: 'evil.example.com',
          },
        },
        (res) => {
          res.resume();
          resolve(res.statusCode || 0);
        }
      );
      req.on('error', reject);
      req.end(JSON.stringify({ id: 'e', timestamp: 1, source: 'kimi', session_id: 's', event_type: 'tool_start' }));
    });
    assert.equal(status, 403);
  });

  describe('workspace file APIs', () => {
    let workspace: string;
    let sessionId: string;

    before(async () => {
      workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-it-'));
      fs.mkdirSync(path.join(workspace, 'src'), { recursive: true });
      fs.writeFileSync(path.join(workspace, 'src', 'a.txt'), 'alpha');
      fs.writeFileSync(path.join(workspace, 'b.txt'), 'beta');

      sessionId = 'sess-ws';
      const res = await fetch(`http://127.0.0.1:${port}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'ev-ws',
          timestamp: Date.now(),
          source: 'kimi',
          session_id: sessionId,
          event_type: 'session_start',
          workspacePath: workspace,
        }),
      });
      assert.equal(res.status, 200);
    });

    after(async () => {
      fs.rmSync(workspace, { recursive: true, force: true });
    });

    it('lists files inside the session workspace', async () => {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/workspace-files?sessionId=${sessionId}`
      );
      assert.equal(res.status, 200);
      const files = (await res.json()) as string[];
      assert.deepEqual(files.sort(), ['b.txt', 'src/a.txt'].sort());
    });

    it('returns file content for a path inside the workspace', async () => {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/file-content?sessionId=${sessionId}&path=src%2Fa.txt`
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as { content: string };
      assert.equal(body.content, 'alpha');
    });

    it('rejects traversal outside the workspace', async () => {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/file-content?sessionId=${sessionId}&path=..%2F..%2Fetc%2Fpasswd`
      );
      assert.equal(res.status, 403);
    });

    it('rejects absolute paths outside the workspace', async () => {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/file-content?sessionId=${sessionId}&path=%2Fetc%2Fpasswd`
      );
      assert.equal(res.status, 403);
    });

    it('does not authorize paths that merely contain the session id', async () => {
      const target = path.join(os.tmpdir(), `${sessionId}-file.txt`);
      fs.writeFileSync(target, 'forged');
      try {
        const res = await fetch(
          `http://127.0.0.1:${port}/api/file-content?sessionId=${sessionId}&path=${encodeURIComponent(target)}`
        );
        assert.equal(res.status, 403);
      } finally {
        fs.rmSync(target, { force: true });
      }
    });

    it('rejects symlinks escaping the workspace', async (t) => {
      const outside = path.join(os.tmpdir(), 'crewloop-leak.txt');
      fs.writeFileSync(outside, 'leak');
      try {
        fs.symlinkSync(outside, path.join(workspace, 'link.txt'));
      } catch (err: any) {
        if (err.code === 'EPERM') {
          t.skip();
          fs.rmSync(outside, { force: true });
          return;
        }
        throw err;
      }
      try {
        const res = await fetch(
          `http://127.0.0.1:${port}/api/file-content?sessionId=${sessionId}&path=link.txt`
        );
        assert.equal(res.status, 403);
      } finally {
        fs.rmSync(path.join(workspace, 'link.txt'), { force: true });
        fs.rmSync(outside, { force: true });
      }
    });

    it('returns 404 for sessions without a workspace root', async () => {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/file-content?sessionId=sess-1&path=src%2Fa.txt`
      );
      assert.equal(res.status, 404);
    });

    it('returns empty diff output for a tracked workspace without git', async () => {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/file-diff?sessionId=${sessionId}&path=src%2Fa.txt`
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as { diff: string };
      assert.equal(typeof body.diff, 'string');
    });

    it('rejects oversized event bodies', async () => {
      const big = 'x'.repeat(128 * 1024);
      const res = await fetch(`http://127.0.0.1:${port}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: big,
      });
      assert.equal(res.status, 413);
    });
  });
});
