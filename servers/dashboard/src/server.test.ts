import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import { createDashboardServer, pruneExpiredSessions } from './server';
import { StateStore } from './state';
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
    telemetryDbPath: ':memory:',
    telemetryTimeZone: 'UTC',
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

  it('rejects malformed events without mutating state or broadcasting', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 2000);
      ws.once('message', () => {
        clearTimeout(timer);
        resolve();
      });
    });

    let broadcasted = false;
    const listener = (data: WebSocket.RawData) => {
      const message = JSON.parse(data.toString()) as { type?: string; session?: { id?: string } };
      if (message.type === 'update' && message.session?.id === 'sess-invalid-contract') {
        broadcasted = true;
      }
    };
    ws.on('message', listener);

    const res = await fetch(`http://127.0.0.1:${port}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ev-invalid-contract',
        timestamp: 'not-a-number',
        source: 'codex',
        session_id: 'sess-invalid-contract',
        event_type: 'tool_start',
        tool: 'Read',
      }),
    });
    await new Promise((resolve) => setTimeout(resolve, 100));

    ws.off('message', listener);
    ws.close();
    assert.equal(res.status, 400);
    assert.equal(server.state.getSession('sess-invalid-contract'), undefined);
    assert.equal(broadcasted, false);
  });

  it('emits typed remove messages and cleans pruned workspace mappings', () => {
    const state = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 10 });
    state.applyEvent({
      id: 'prune-event',
      timestamp: 100,
      source: 'codex',
      session_id: 'sess-prune-contract',
      event_type: 'session_start',
      workspacePath: process.cwd(),
    });
    const messages: Array<{ type: string; sessionId?: string; reason?: string }> = [];

    const result = pruneExpiredSessions(
      state,
      (message) => messages.push(message as typeof messages[number]),
      'sess-prune-contract',
      1_000
    );

    assert.deepEqual(result.removedSessionIds, ['sess-prune-contract']);
    assert.equal(result.activeSessionId, undefined);
    assert.deepEqual(messages, [{ type: 'remove', sessionId: 'sess-prune-contract', reason: 'pruned' }]);

    const restored = new StateStore({ maxEventsPerSession: 10, sessionMaxAgeMs: 10 });
    assert.equal(
      restored.applyEvent({
        id: 'after-prune',
        timestamp: 2_000,
        source: 'codex',
        session_id: 'sess-prune-contract',
        event_type: 'session_start',
      }).workspaceRoot,
      undefined
    );
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
          input: { path: path.join(workspace, 'src', 'a.txt') },
        }),
      });
      assert.equal(res.status, 200);
      const session = server.state.getSession(sessionId)!;
      assert.equal(session.workspaceRoot, workspace);
      assert.equal(session.events[0].input?.path, 'src/a.txt');
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

  it('removes dangerous nested input fields before state and broadcast', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
      headers: { Origin: `http://127.0.0.1:${port}` },
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 2000);
      ws.once('message', () => {
        clearTimeout(timer);
        resolve();
      });
    });

    type Message = { type: string; session?: { id: string; events: Array<{ id: string; input?: Record<string, unknown> }> } };
    const updatePromise = new Promise<Message>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 2000);
      const listener = (data: WebSocket.RawData) => {
        const message = JSON.parse(data.toString()) as Message;
        if (message.type === 'update' && message.session?.id === 'sess-nested-input') {
          clearTimeout(timer);
          ws.off('message', listener);
          resolve(message);
        }
      };
      ws.on('message', listener);
    });

    const response = await fetch(`http://127.0.0.1:${port}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ev-nested-input',
        timestamp: Date.now(),
        source: 'codex',
        session_id: 'sess-nested-input',
        event_type: 'tool_start',
        tool: 'apply_patch',
        input: {
          command: 'RAW_PATCH_BODY',
          content: 'RAW_FILE_CONTENT',
          operations: [
            {
              path: 'src/a.ts',
              diff: [
                '*** Update File: src/a.ts',
                '+API_KEY=RAW_DIFF_SECRET',
                '+safe derived diff',
              ].join('\n'),
              token: 'RAW_TOKEN',
            },
            {
              path: '.env',
              diff: '*** Update File: .env\n+DB_PASSWORD=RAW_ENV_SECRET',
            },
          ],
        },
      }),
    });
    assert.equal(response.status, 200);

    const update = await updatePromise;
    const event = update.session!.events.find((candidate) => candidate.id === 'ev-nested-input');
    assert.deepEqual(event?.input, {
      operations: [
        {
          path: 'src/a.ts',
          diff: [
            '*** Update File: src/a.ts',
            '+[redacted sensitive line]',
            '+safe derived diff',
          ].join('\n'),
        },
        { path: '.env' },
      ],
    });
    assert.equal(JSON.stringify(event).includes('RAW_PATCH_BODY'), false);
    assert.equal(JSON.stringify(event).includes('RAW_FILE_CONTENT'), false);
    assert.equal(JSON.stringify(event).includes('RAW_TOKEN'), false);
    assert.equal(JSON.stringify(event).includes('RAW_DIFF_SECRET'), false);
    assert.equal(JSON.stringify(event).includes('RAW_ENV_SECRET'), false);
    ws.close();
  });

  it('broadcasts validated token usage and drops invalid usage only', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
      headers: { Origin: `http://127.0.0.1:${port}` },
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 2000);
      ws.once('message', () => {
        clearTimeout(timer);
        resolve();
      });
    });

    type Message = { type: string; session?: { id: string; tokenUsage?: { quality: string; totalTokens: number; model?: string } } };
    const nextUpdate = (sessionId: string) => new Promise<Message>((resolve) => {
      const listener = (data: WebSocket.RawData) => {
        const message = JSON.parse(data.toString()) as Message;
        if (message.type === 'update' && message.session?.id === sessionId) {
          ws.off('message', listener);
          resolve(message);
        }
      };
      ws.on('message', listener);
    });

    const validUpdate = nextUpdate('sess-token-valid');
    const validResponse = await fetch(`http://127.0.0.1:${port}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ev-token-valid',
        timestamp: 1000,
        source: 'codex',
        session_id: 'sess-token-valid',
        event_type: 'session_end',
        token_usage: {
          inputTokens: 80,
          outputTokens: 20,
          cacheReadTokens: 10,
          cacheWriteTokens: 0,
          reasoningTokens: 5,
          totalTokens: 100,
          measurementId: 'measurement-valid',
          capturedAt: 1000,
          source: 'codex',
          model: 'gpt-test',
          quality: 'measured',
          semantics: 'cumulative',
        },
      }),
    });
    assert.equal(validResponse.status, 200);
    const validMessage = await validUpdate;
    assert.equal(validMessage.session!.tokenUsage!.totalTokens, 100);
    assert.equal(validMessage.session!.tokenUsage!.model, 'gpt-test');

    const multiUpdate = nextUpdate('sess-token-multi');
    const multiResponse = await fetch(`http://127.0.0.1:${port}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ev-token-multi',
        timestamp: 2_000,
        source: 'kimi',
        session_id: 'sess-token-multi',
        event_type: 'tool_end',
        token_usages: ['a', 'b'].map((wire, index) => ({
          inputTokens: 100,
          outputTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          reasoningTokens: 0,
          totalTokens: 100,
          measurementId: `measurement-${wire}`,
          capturedAt: 2_000 + index,
          source: 'kimi',
          quality: 'measured',
          semantics: 'cumulative',
          cursorKey: `kimi:wire:${wire}`,
          coverage: 'complete',
        })),
      }),
    });
    assert.equal(multiResponse.status, 200);
    const multiMessage = await multiUpdate;
    assert.equal(multiMessage.session!.tokenUsage!.totalTokens, 200);

    const invalidUpdate = nextUpdate('sess-token-invalid');
    const invalidResponse = await fetch(`http://127.0.0.1:${port}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'ev-token-invalid',
        timestamp: 1000,
        source: 'codex',
        session_id: 'sess-token-invalid',
        event_type: 'session_end',
        token_usage: {
          inputTokens: -1,
        },
      }),
    });
    assert.equal(invalidResponse.status, 200);
    const invalidMessage = await invalidUpdate;
    assert.equal(invalidMessage.session!.tokenUsage!.quality, 'unavailable');
    assert.equal(invalidMessage.session!.tokenUsage!.totalTokens, 0);
    ws.close();
  });
});
