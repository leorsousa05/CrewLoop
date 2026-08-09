import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { loadPolicy, DEFAULT_POLICY, saveRememberedConfirmation } from '../guard/policy';
import { evaluatePolicy, matchGlob, extractPaths } from '../guard/evaluator';
import { normalizePayload } from '../guard/normalize';
import { requestConfirmation, POLL_INTERVAL_MS } from '../guard/confirm';

describe('policy loader', () => {
  let tmpDir: string;
  let originalHome: string | undefined;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-guard-policy-'));
    originalHome = process.env.HOME;
    process.env.HOME = tmpDir;
    fs.mkdirSync(path.join(tmpDir, '.crewloop'), { recursive: true });
  });

  after(() => {
    process.env.HOME = originalHome;
  });

  it('returns default policy when no files exist', () => {
    const policy = loadPolicy({ cwd: tmpDir });
    assert.strictEqual(policy.defaultAction, 'allow');
    assert.strictEqual(policy.rules.length, 0);
  });

  it('loads global policy', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.crewloop', 'guard.yml'),
      `version: 1\nmode: block\ndefaultAction: block\nrules:\n  - name: block bash\n    action: block\n    tools:\n      - Bash\n`,
      'utf8'
    );

    const policy = loadPolicy({ cwd: tmpDir });
    assert.strictEqual(policy.mode, 'block');
    assert.strictEqual(policy.rules.length, 1);
    assert.strictEqual(policy.rules[0].name, 'block bash');
  });

  it('merges workspace policy overriding rules by name', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.crewloop', 'guard.yml'),
      `version: 1\nmode: audit\ndefaultAction: allow\nrules:\n  - name: shared\n    action: block\n    tools:\n      - Bash\n`,
      'utf8'
    );

    const workspaceDir = path.join(tmpDir, 'workspace');
    fs.mkdirSync(path.join(workspaceDir, '.crewloop'), { recursive: true });
    fs.writeFileSync(
      path.join(workspaceDir, '.crewloop', 'guard.yml'),
      `rules:\n  - name: shared\n    action: allow\n`,
      'utf8'
    );

    const policy = loadPolicy({ cwd: workspaceDir });
    assert.strictEqual(policy.mode, 'audit');
    assert.strictEqual(policy.rules.length, 1);
    assert.strictEqual(policy.rules[0].action, 'allow');
  });

  it('fails open on invalid YAML', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.crewloop', 'guard.yml'),
      '{ invalid yaml : [ }',
      'utf8'
    );

    const policy = loadPolicy({ cwd: tmpDir });
    assert.deepStrictEqual(policy, DEFAULT_POLICY);
  });

  it('loads confirm rule with confirmationTimeout', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.crewloop', 'guard.yml'),
      `version: 1\nmode: audit\ndefaultAction: allow\nconfirmationTimeout: 120000\nrules:\n  - name: confirm git push\n    action: confirm\n    tools:\n      - Bash\n    commandMatches: git push\n    confirmationTimeout: 60000\n`,
      'utf8'
    );

    const policy = loadPolicy({ cwd: tmpDir });
    assert.strictEqual(policy.confirmationTimeout, 120000);
    assert.strictEqual(policy.rules.length, 1);
    assert.strictEqual(policy.rules[0].action, 'confirm');
    assert.strictEqual(policy.rules[0].confirmationTimeout, 60000);
  });

  it('overrides confirm rule action to allow when present in confirmations.yml', () => {
    const workspaceDir = path.join(tmpDir, 'remembered-workspace');
    fs.mkdirSync(path.join(workspaceDir, '.crewloop'), { recursive: true });
    fs.writeFileSync(
      path.join(workspaceDir, '.crewloop', 'guard.yml'),
      `rules:\n  - name: confirm git push\n    action: confirm\n    tools:\n      - Bash\n`,
      'utf8'
    );

    saveRememberedConfirmation(workspaceDir, 'confirm git push');

    const policy = loadPolicy({ cwd: workspaceDir });
    assert.strictEqual(policy.rules.length, 1);
    assert.strictEqual(policy.rules[0].name, 'confirm git push');
    assert.strictEqual(policy.rules[0].action, 'allow');
  });

  it('fails open on invalid confirmationTimeout', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.crewloop', 'guard.yml'),
      `version: 1\nmode: audit\ndefaultAction: allow\nconfirmationTimeout: -1\nrules:\n  - name: confirm git push\n    action: confirm\n    tools:\n      - Bash\n`,
      'utf8'
    );

    const policy = loadPolicy({ cwd: tmpDir });
    assert.deepStrictEqual(policy, DEFAULT_POLICY);
  });
});

function freshPolicy(overrides: Partial<import('../guard/guard.types').GuardPolicy> = {}): import('../guard/guard.types').GuardPolicy {
  return {
    version: 1,
    mode: 'audit',
    defaultAction: 'allow',
    rules: [],
    ...overrides,
  };
}

describe('evaluator', () => {
  it('allows by default', () => {
    const decision = evaluatePolicy(freshPolicy(), {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Bash',
      cwd: '/tmp',
    });
    assert.strictEqual(decision.action, 'allow');
  });

  it('blocks matching tool', () => {
    const policy = freshPolicy({
      rules: [{ name: 'block bash', action: 'block', tools: ['Bash'] }],
    });

    const decision = evaluatePolicy(policy, {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Bash',
      cwd: '/tmp',
    });
    assert.strictEqual(decision.action, 'block');
    assert.strictEqual(decision.rule, 'block bash');
  });

  it('matches command regex', () => {
    const policy = freshPolicy({
      rules: [{ name: 'block rm', action: 'block', tools: ['Bash'], commandMatches: '^rm\\s' }],
    });

    const allowDecision = evaluatePolicy(policy, {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Bash',
      input: { command: 'ls -la' },
      cwd: '/tmp',
    });
    assert.strictEqual(allowDecision.action, 'allow');

    const blockDecision = evaluatePolicy(policy, {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Bash',
      input: { command: 'rm -rf /' },
      cwd: '/tmp',
    });
    assert.strictEqual(blockDecision.action, 'block');
  });

  it('matches path globs', () => {
    const policy = freshPolicy({
      rules: [{ name: 'block ssh reads', action: 'block', tools: ['Read'], paths: ['/home/user/.ssh/*'] }],
    });

    const blockDecision = evaluatePolicy(policy, {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Read',
      input: { path: '/home/user/.ssh/id_rsa' },
      cwd: '/tmp',
    });
    assert.strictEqual(blockDecision.action, 'block');

    const allowDecision = evaluatePolicy(policy, {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Read',
      input: { path: '/etc/passwd' },
      cwd: '/tmp',
    });
    assert.strictEqual(allowDecision.action, 'allow');
  });

  it('respects negated path patterns', () => {
    const policy = freshPolicy({
      rules: [{ name: 'block writes outside workspace', action: 'block', tools: ['Write'], paths: ['/tmp/workspace/**', '!/tmp/workspace/**'] }],
    });

    const decision = evaluatePolicy(policy, {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Write',
      input: { path: '/tmp/workspace/file.txt' },
      cwd: '/tmp/workspace',
    });
    assert.strictEqual(decision.action, 'allow');
  });

  it('returns confirm for matching rule', () => {
    const policy = freshPolicy({
      rules: [{ name: 'confirm git push', action: 'confirm', tools: ['Bash'], commandMatches: 'git push' }],
    });

    const decision = evaluatePolicy(policy, {
      agent: 'kimi',
      session_id: 's1',
      tool: 'Bash',
      input: { command: 'git push origin main' },
      cwd: '/proj',
    });
    assert.strictEqual(decision.action, 'confirm');
    assert.strictEqual(decision.rule, 'confirm git push');
  });
});

describe('normalizePayload', () => {
  it('normalizes AGY run_command payload correctly', () => {
    const raw = {
      conversationId: 'agy-session-123',
      cwd: '/workspace',
      toolCall: {
        name: 'run_command',
        args: {
          CommandLine: 'git push origin main',
        },
      },
    };
    const event = normalizePayload('agy', raw);
    assert.ok(event);
    assert.strictEqual(event!.agent, 'agy');
    assert.strictEqual(event!.session_id, 'agy-session-123');
    assert.strictEqual(event!.tool, 'run_command');
    assert.strictEqual(event!.cwd, '/workspace');

    const policy = {
      version: 1,
      mode: 'block' as const,
      defaultAction: 'allow' as const,
      rules: [
        {
          name: 'confirm git push',
          action: 'confirm' as const,
          tools: ['run_command'],
          commandMatches: 'git push',
        },
      ],
    };
    const decision = evaluatePolicy(policy, event!);
    assert.strictEqual(decision.action, 'confirm');
    assert.strictEqual(decision.rule, 'confirm git push');
  });

  it('normalizes Kimi payload', () => {
    const event = normalizePayload('kimi', {
      hook_event_name: 'PreToolUse',
      session_id: 'sess-1',
      cwd: '/proj',
      tool_name: 'Read',
      tool_input: { path: '/proj/file.ts' },
    });

    assert.ok(event);
    assert.strictEqual(event!.session_id, 'sess-1');
    assert.strictEqual(event!.tool, 'Read');
    assert.strictEqual(event!.cwd, '/proj');
    assert.deepStrictEqual(event!.input, { path: '/proj/file.ts' });
  });

  it('normalizes Claude payload', () => {
    const event = normalizePayload('claude', {
      hook_event_name: 'PreToolUse',
      session_id: 'sess-2',
      cwd: '/proj',
      tool_name: 'Bash',
      tool_input: { command: 'ls' },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'Bash');
    assert.strictEqual(event!.session_id, 'sess-2');
  });

  it('normalizes Codex payload', () => {
    const event = normalizePayload('codex', {
      hook_event_name: 'PreToolUse',
      session_id: 'sess-3',
      cwd: '/proj',
      tool: { name: 'Write', input: { path: '/proj/out.txt' } },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'Write');
  });

  it('normalizes AGY payload', () => {
    const event = normalizePayload('agy', {
      hook_event_name: 'PreToolUse',
      conversationId: 'sess-4',
      cwd: '/proj',
      toolCall: { name: 'Read', args: { path: '/proj/file.ts' } },
    });

    assert.ok(event);
    assert.strictEqual(event!.session_id, 'sess-4');
    assert.strictEqual(event!.tool, 'Read');
  });
});

describe('matchGlob', () => {
  it('matches literal strings', () => {
    assert.ok(matchGlob('/foo/bar', '/foo/bar'));
    assert.ok(!matchGlob('/foo/bar', '/foo/baz'));
  });

  it('matches single star segments', () => {
    assert.ok(matchGlob('/foo/bar/baz', '/foo/*/baz'));
    assert.ok(!matchGlob('/foo/bar/baz', '/foo/*'));
  });

  it('matches double star recursively', () => {
    assert.ok(matchGlob('/foo/bar/baz', '/foo/**'));
    assert.ok(matchGlob('/foo/bar/baz/qux', '/foo/**/qux'));
  });
});

describe('extractPaths', () => {
  it('extracts path fields from nested input', () => {
    const paths = extractPaths({
      path: '/tmp/file.ts',
      nested: { AbsolutePath: '/tmp/other.ts' },
      operations: [{ path: '/tmp/op.ts' }],
    });

    assert.deepStrictEqual(paths.sort(), ['/tmp/file.ts', '/tmp/op.ts', '/tmp/other.ts']);
  });
});

function startConfirmationServer(
  responses: Array<{ status: 'pending' | 'approved' | 'denied'; remember?: boolean }>
): Promise<{
  server: http.Server;
  port: number;
  events: Array<Record<string, unknown>>;
  statusRequests: string[];
  waitForEvents(count: number): Promise<void>;
}> {
  let requestIndex = 0;
  const events: Array<Record<string, unknown>> = [];
  const statusRequests: string[] = [];
  let eventTarget = 0;
  let eventResolve: (() => void) | undefined;

  function checkEvents() {
    if (eventResolve && events.length >= eventTarget) {
      eventResolve();
      eventResolve = undefined;
    }
  }

  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/event') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          events.push(JSON.parse(body));
        } catch {
          events.push({ raw: body });
        }
        checkEvents();
        res.writeHead(200);
        res.end('{}');
      });
      return;
    }

    const match = req.url?.match(/^\/api\/security\/confirmations\/([^/]+)$/);
    if (req.method === 'GET' && match) {
      statusRequests.push(match[1]);
      const response = responses[Math.min(requestIndex++, responses.length - 1)] ?? { status: 'pending' };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    res.writeHead(404);
    res.end();
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolve({
        server,
        port,
        events,
        statusRequests,
        waitForEvents(count: number) {
          eventTarget = count;
          return new Promise<void>((resolve) => {
            if (events.length >= count) {
              resolve();
              return;
            }
            eventResolve = resolve;
          });
        },
      });
    });
  });
}

describe('confirmation polling', () => {
  it('posts pending decision and returns allow on approval', async () => {
    const { server, port, events, statusRequests, waitForEvents } = await startConfirmationServer([
      { status: 'pending' },
      { status: 'approved' },
    ]);
    try {
      const result = await requestConfirmation(
        { agent: 'kimi', session_id: 's1', tool: 'Bash', cwd: '/proj', input: { command: 'git push origin main' } },
        { action: 'confirm', rule: 'confirm git push', reason: 'matches /git push/' },
        { serverUrl: `http://127.0.0.1:${port}`, timeout: 5000 }
      );
      await waitForEvents(1);
      assert.strictEqual(result.action, 'allow');
      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].event_type, 'security_decision');
      assert.strictEqual(events[0].decision, 'pending');
      assert.strictEqual(events[0].source, 'guard');
      assert.strictEqual(typeof events[0].confirmationId, 'string');
      assert.strictEqual(events[0].confirmationId, statusRequests[0]);
      assert.ok(statusRequests.length >= 2);
    } finally {
      server.close();
    }
  });

  it('returns block on timeout', async () => {
    const { server, port, events, waitForEvents } = await startConfirmationServer([{ status: 'pending' }]);
    try {
      const start = Date.now();
      const result = await requestConfirmation(
        { agent: 'kimi', session_id: 's1', tool: 'Bash', cwd: '/proj', input: { command: 'git push origin main' } },
        { action: 'confirm', rule: 'confirm git push' },
        { serverUrl: `http://127.0.0.1:${port}`, timeout: POLL_INTERVAL_MS + 50 }
      );
      await waitForEvents(1);
      const elapsed = Date.now() - start;
      assert.strictEqual(result.action, 'block');
      assert.ok(elapsed >= POLL_INTERVAL_MS, `elapsed ${elapsed}ms should be at least ${POLL_INTERVAL_MS}ms`);
      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].decision, 'pending');
    } finally {
      server.close();
    }
  });

  it('returns block when confirmation is denied', async () => {
    const { server, port, events, waitForEvents } = await startConfirmationServer([
      { status: 'pending' },
      { status: 'denied' },
    ]);
    try {
      const result = await requestConfirmation(
        { agent: 'kimi', session_id: 's1', tool: 'Bash', cwd: '/proj', input: { command: 'git push origin main' } },
        { action: 'confirm', rule: 'confirm git push' },
        { serverUrl: `http://127.0.0.1:${port}`, timeout: 5000 }
      );
      await waitForEvents(1);
      assert.strictEqual(result.action, 'block');
      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].decision, 'pending');
    } finally {
      server.close();
    }
  });
});
