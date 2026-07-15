import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { spawn } from 'node:child_process';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { runShim } from '../adapters/shim';

function runBin(
  args: string[],
  input?: string,
  env?: Record<string, string>
): Promise<{ exitCode: number | null; stderr: string }> {
  const binPath = path.join(__dirname, '..', '..', 'bin', 'crewloop-shim.js');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [binPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: env ? { ...process.env, ...env } : process.env,
    });
    let stderr = '';
    child.stderr!.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (exitCode) => {
      resolve({ exitCode, stderr });
    });
    if (input !== undefined) {
      child.stdin!.write(input);
    }
    child.stdin!.end();
  });
}

describe('shim binary', () => {
  it('exports runShim from adapters/shim', () => {
    assert.strictEqual(typeof runShim, 'function');
  });

  it('exits 0 for a supported source with empty stdin', async () => {
    const { exitCode, stderr } = await runBin(['kimi']);
    assert.strictEqual(exitCode, 0);
    assert.strictEqual(stderr, '');
  });

  it('exits 1 and prints usage for an unsupported source', async () => {
    const { exitCode, stderr } = await runBin(['unknown']);
    assert.strictEqual(exitCode, 1);
    assert.ok(stderr.includes('unknown source'));
    assert.ok(stderr.includes('crewloop-shim <kimi|claude|codex|agy|opencode>'));
  });

  it('exits 0 for agy source with empty stdin', async () => {
    const { exitCode, stderr } = await runBin(['agy']);
    assert.strictEqual(exitCode, 0);
    assert.strictEqual(stderr, '');
  });

  it('delivers a POST /event before exiting', async () => {
    let receivedBody: string | undefined;
    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/event') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          receivedBody = body;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        });
      }
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    const input = JSON.stringify({
      hook_event_name: 'PostToolUse',
      session_id: 'test-session',
      cwd: '/tmp',
      tool_name: 'TestTool',
      tool_input: { command: 'echo hello' },
      tool_output: 'hello\n',
    });

    try {
      const { exitCode } = await runBin(
        ['kimi', '--default-skill', 'crewloop-hub'],
        input,
        { CREWLOOP_DASHBOARD_URL: `http://127.0.0.1:${port}` }
      );

      assert.strictEqual(exitCode, 0);
      assert.ok(receivedBody, 'shim should have sent a request body');
      const parsed = JSON.parse(receivedBody!);
      assert.strictEqual(parsed.event_type, 'tool_end');
      assert.strictEqual(parsed.source, 'kimi');
      assert.strictEqual(parsed.session_id, 'test-session');
      assert.deepStrictEqual(parsed.input, { command: 'echo hello' });
      assert.deepStrictEqual(parsed.output, { output: 'hello\n' });
    } finally {
      server.close();
    }
  });

  it('delivers AGY event with default skill fallback', async () => {
    let receivedBody: string | undefined;
    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/event') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          receivedBody = body;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        });
      }
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    const input = JSON.stringify({
      hook_event_name: 'PreToolUse',
      conversationId: 'agy-session',
      stepIdx: 0,
      toolCall: {
        name: 'run_command',
        args: { CommandLine: 'git status' },
      },
    });

    try {
      const { exitCode } = await runBin(
        ['agy', '--default-skill', 'crewloop-hub'],
        input,
        { CREWLOOP_DASHBOARD_URL: `http://127.0.0.1:${port}` }
      );

      assert.strictEqual(exitCode, 0);
      assert.ok(receivedBody, 'shim should have sent a request body');
      const parsed = JSON.parse(receivedBody!);
      assert.strictEqual(parsed.event_type, 'tool_start');
      assert.strictEqual(parsed.source, 'agy');
      assert.strictEqual(parsed.skill, undefined);
      assert.strictEqual(parsed.default_skill, 'crewloop-hub');
    } finally {
      server.close();
    }
  });
});
