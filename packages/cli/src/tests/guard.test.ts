import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadPolicy, DEFAULT_POLICY } from '../guard/policy';
import { evaluatePolicy, matchGlob, extractPaths } from '../guard/evaluator';
import { normalizePayload } from '../guard/normalize';

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
});

describe('normalizePayload', () => {
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
