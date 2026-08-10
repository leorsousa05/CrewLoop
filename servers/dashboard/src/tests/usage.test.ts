import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';
import { createDashboardServer } from '../server';
import type { ServerConfig } from '../types';

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

function postUsage(port: number, body: unknown): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/ingest/usage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed: unknown;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode || 0, body: parsed });
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

describe('POST /ingest/usage', () => {
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

  it('merges Kimi usage into a new session', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 2000);
      ws.once('message', () => {
        clearTimeout(timer);
        resolve();
      });
    });

    type Update = { type: string; session?: { id: string; tokenUsage?: { quality: string; totalTokens: number; model?: string } } };
    const nextUpdate = (sessionId: string) => new Promise<Update>((resolve) => {
      const listener = (data: WebSocket.RawData) => {
        const message = JSON.parse(data.toString()) as Update;
        if (message.type === 'update' && message.session?.id === sessionId) {
          ws.off('message', listener);
          resolve(message);
        }
      };
      ws.on('message', listener);
    });

    const update = nextUpdate('sess-ingest-1');
    const res = await postUsage(port, {
      session_id: 'sess-ingest-1',
      source: 'kimi',
      model: 'kimi-k3',
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });

    const message = await update;
    assert.equal(message.session!.tokenUsage!.quality, 'measured');
    assert.equal(message.session!.tokenUsage!.totalTokens, 150);
    assert.equal(message.session!.tokenUsage!.model, 'kimi-k3');
    ws.close();
  });

  it('rejects missing session_id', async () => {
    const res = await postUsage(port, {
      usage: { total_tokens: 100 },
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Missing session_id' });
  });

  it('rejects invalid source', async () => {
    const res = await postUsage(port, {
      session_id: 'sess-invalid-source',
      source: 'unknown',
      usage: { total_tokens: 100 },
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Invalid source' });
  });

  it('rejects invalid token counts', async () => {
    const res = await postUsage(port, {
      session_id: 'sess-invalid-usage',
      usage: { input_tokens: -1 },
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Invalid usage' });
  });

  it('rejects missing usage', async () => {
    const res = await postUsage(port, {
      session_id: 'sess-missing-usage',
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Missing usage' });
  });

  it('de-duplicates repeated ingestion', async () => {
    const res1 = await postUsage(port, {
      session_id: 'sess-dedup',
      timestamp: 1000,
      usage: { total_tokens: 100 },
    });
    assert.equal(res1.status, 200);

    const session1 = server.state.getSession('sess-dedup');
    assert.equal(session1!.token_usage.totalTokens, 100);
    assert.equal(session1!.token_usage.measurementCount, 1);

    const res2 = await postUsage(port, {
      session_id: 'sess-dedup',
      timestamp: 1000,
      usage: { total_tokens: 100 },
    });
    assert.equal(res2.status, 200);

    const session2 = server.state.getSession('sess-dedup');
    assert.equal(session2!.token_usage.totalTokens, 100);
    assert.equal(session2!.token_usage.measurementCount, 1);
  });

  it('requires stable identity for deltas and de-duplicates timestamped retries', async () => {
    const rejected = await postUsage(port, {
      session_id: 'sess-delta-unstable',
      semantics: 'delta',
      usage: { total_tokens: 25 },
    });
    assert.equal(rejected.status, 400);
    assert.deepEqual(rejected.body, {
      error: 'Delta usage requires a stable measurement_id or timestamp',
      code: 'STABLE_MEASUREMENT_ID_REQUIRED',
    });

    const request = {
      session_id: 'sess-delta-stable',
      semantics: 'delta',
      timestamp: 2_000,
      usage: { total_tokens: 25 },
    };
    assert.equal((await postUsage(port, request)).status, 200);
    assert.equal((await postUsage(port, request)).status, 200);
    const session = server.state.getSession('sess-delta-stable');
    assert.equal(session?.token_usage.totalTokens, 25);
    assert.equal(session?.token_usage.measurementCount, 1);
  });

  it('forwards usage via the crewloop-ingest-kimi helper', async () => {
    const binPath = path.join(__dirname, '..', '..', 'bin', 'crewloop-ingest-kimi.js');
    const stderr = await new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, [binPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, CREWLOOP_DASHBOARD_URL: `http://127.0.0.1:${port}` },
      });
      let err = '';
      child.stderr!.on('data', (chunk) => {
        err += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (exitCode) => {
        if (exitCode !== 0) {
          reject(new Error(`helper exited ${exitCode}: ${err}`));
          return;
        }
        resolve(err);
      });
      child.stdin!.write(JSON.stringify({
        session_id: 'sess-helper',
        model: 'kimi-k3',
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }));
      child.stdin!.end();
    });
    assert.equal(stderr, '');

    const session = server.state.getSession('sess-helper');
    assert.equal(session!.token_usage.quality, 'measured');
    assert.equal(session!.token_usage.totalTokens, 15);
    assert.equal(session!.token_usage.inputTokens, 10);
    assert.equal(session!.token_usage.outputTokens, 5);
  });
});
