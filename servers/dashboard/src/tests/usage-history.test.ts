import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
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

function config(port: number): ServerConfig {
  return {
    port,
    host: '127.0.0.1',
    packageRoot: process.cwd(),
    maxEventsPerSession: 100,
    sessionMaxAgeMs: 60_000,
    sessionIdleTimeoutMs: 60_000,
    pruneIntervalMs: 60_000,
    eventBodyBytes: 64 * 1024,
    fileBytes: 1024 * 1024,
    workspaceEntries: 5_000,
    workspaceDepth: 20,
    telemetryDbPath: ':memory:',
    telemetryTimeZone: 'UTC',
  };
}

describe('usage history APIs', () => {
  let port: number;
  let server: ReturnType<typeof createDashboardServer>;

  before(async () => {
    port = await getFreePort();
    server = createDashboardServer(config(port));
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  it('accepts caller-stable measurement IDs and reports five product states', async () => {
    const request = {
      session_id: 'api-session',
      source: 'codex',
      model: 'gpt-5.6-luna',
      timestamp: Date.now(),
      measurement_id: 'provider-message-1',
      semantics: 'delta',
      cost_usd: 0.000123,
      usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
    };
    const first = await fetch(`http://127.0.0.1:${port}/ingest/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const replay = await fetch(`http://127.0.0.1:${port}/ingest/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, timestamp: request.timestamp + 1 }),
    });
    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);

    const response = await fetch(`http://127.0.0.1:${port}/api/usage/daily`);
    assert.equal(response.status, 200);
    const body = await response.json() as {
      range: { timeZone: string };
      products: Array<{ product: string; totalTokens: number | null; costQuality: string }>;
    };
    assert.equal(body.range.timeZone, 'UTC');
    assert.equal(body.products.length, 5);
    assert.equal(body.products.find((row) => row.product === 'codex')?.totalTokens, 15);
    assert.equal(body.products.find((row) => row.product === 'codex')?.costQuality, 'reported');
    assert.equal(body.products.find((row) => row.product === 'kimi')?.totalTokens, null);
  });

  it('validates finite ranges and supports mutually exclusive all history', async () => {
    const tooLong = await fetch(
      `http://127.0.0.1:${port}/api/usage/daily?from=2025-01-01&to=2026-12-31`
    );
    assert.equal(tooLong.status, 400);
    assert.equal((await tooLong.json() as { code: string }).code, 'INVALID_USAGE_RANGE');

    const combined = await fetch(
      `http://127.0.0.1:${port}/api/usage/daily?range=all&from=2026-01-01&to=2026-01-02`
    );
    assert.equal(combined.status, 400);

    const all = await fetch(`http://127.0.0.1:${port}/api/usage/daily?range=all`);
    assert.equal(all.status, 200);
  });

  it('requires exact reset confirmation and clears visible usage', async () => {
    const rejected = await fetch(`http://127.0.0.1:${port}/api/usage/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'yes' }),
    });
    assert.equal(rejected.status, 400);

    const reset = await fetch(`http://127.0.0.1:${port}/api/usage/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'RESET' }),
    });
    assert.equal(reset.status, 200);
    const body = await reset.json() as { deletedMeasurements: number };
    assert.equal(body.deletedMeasurements, 1);

    const usage = await fetch(`http://127.0.0.1:${port}/api/usage/daily`);
    const response = await usage.json() as { products: Array<{ totalTokens: number | null }> };
    assert.equal(response.products.every((row) => row.totalTokens === null), true);
    assert.equal(server.state.getSession('api-session')?.token_usage.totalTokens, 0);
  });

  it('returns safe 503 errors when persistence is unavailable', async () => {
    server.usageRepository.close();
    const response = await fetch(`http://127.0.0.1:${port}/ingest/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'failed-write',
        source: 'codex',
        measurement_id: 'failed-1',
        semantics: 'delta',
        usage: { total_tokens: 10 },
      }),
    });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: 'Usage persistence unavailable',
      code: 'USAGE_WRITE_FAILED',
    });
    assert.equal(server.state.getSession('failed-write')?.token_usage.totalTokens ?? 0, 0);
  });
});
