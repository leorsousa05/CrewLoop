import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalizeKimi } from '../adapters/kimi';
import { normalizeClaude } from '../adapters/claude';
import { normalizeCodex, type CodexHookPayload } from '../adapters/codex';
import { normalizeAgy } from '../adapters/agy';
import { validateTokenUsageMeasurement } from '../telemetry/token-usage';

describe('normalizeKimi', () => {
  it('forwards tool_input as input', () => {
    const event = normalizeKimi({
      hook_event_name: 'PreToolUse',
      session_id: 'session-1',
      cwd: '/tmp',
      tool_name: 'Bash',
      tool_input: { command: 'echo hello' },
    });

    assert.ok(event);
    assert.strictEqual(event!.event_type, 'tool_start');
    assert.deepStrictEqual(event!.input, { command: 'echo hello' });
    assert.strictEqual(event!.output, undefined);
    assert.strictEqual(event!.workspacePath, '/tmp');
  });

  it('forwards tool_output object as output', () => {
    const event = normalizeKimi({
      hook_event_name: 'PostToolUse',
      session_id: 'session-1',
      cwd: '/tmp',
      tool_name: 'Bash',
      tool_input: { command: 'echo hello' },
      tool_output: { stdout: 'hello\n' },
    });

    assert.ok(event);
    assert.strictEqual(event!.event_type, 'tool_end');
    assert.deepStrictEqual(event!.input, { command: 'echo hello' });
    assert.deepStrictEqual(event!.output, { stdout: 'hello\n' });
  });

  it('wraps string tool_output in an object', () => {
    const event = normalizeKimi({
      hook_event_name: 'PostToolUse',
      session_id: 'session-1',
      cwd: '/tmp',
      tool_name: 'Bash',
      tool_input: { command: 'echo hello' },
      tool_output: 'hello\n',
    });

    assert.ok(event);
    assert.deepStrictEqual(event!.output, { output: 'hello\n' });
  });

  it('parses JSON string tool_output as an object', () => {
    const event = normalizeKimi({
      hook_event_name: 'PostToolUse',
      session_id: 'session-1',
      cwd: '/tmp',
      tool_name: 'Bash',
      tool_output: '{"stdout":"hello"}',
    });

    assert.ok(event);
    assert.deepStrictEqual(event!.output, { stdout: 'hello' });
  });

  it('normalizes measured usage without copying the raw payload', () => {
    const event = normalizeKimi({
      hook_event_name: 'SessionEnd',
      session_id: 'session-usage',
      cwd: '/tmp',
      model: 'kimi-test',
      usage: {
        input_tokens: 900,
        output_tokens: 100,
        cache_read_input_tokens: 250,
        total_tokens: 1000,
      },
    });

    assert.ok(event?.token_usage);
    assert.equal(event!.token_usage!.totalTokens, 1000);
    assert.equal(event!.token_usage!.cacheReadTokens, 250);
    assert.equal(event!.token_usage!.model, 'kimi-test');
    assert.equal(event!.input, undefined);
    assert.equal(event!.output, undefined);
  });

  it('drops malformed usage while preserving the event', () => {
    const event = normalizeKimi({
      hook_event_name: 'SessionEnd',
      session_id: 'session-usage',
      cwd: '/tmp',
      usage: { input_tokens: '900' },
    });
    assert.ok(event);
    assert.equal(event!.token_usage, undefined);
  });

  it('produces a token_usage measurement that survives boundary validation', () => {
    const event = normalizeKimi({
      hook_event_name: 'Stop',
      session_id: 'session-usage',
      cwd: '/tmp',
      model: 'kimi-k3',
      usage: {
        input_tokens: 900,
        output_tokens: 100,
        cache_read_input_tokens: 250,
        total_tokens: 1000,
      },
    });

    assert.ok(event?.token_usage);
    const validated = validateTokenUsageMeasurement(event!.token_usage);
    assert.ok(validated, 'token_usage should pass boundary validation');
    assert.equal(validated!.totalTokens, 1000);
    assert.equal(validated!.model, 'kimi-k3');
    assert.equal(validated!.source, 'kimi');
  });

  it('falls back to the Kimi wire log when the payload carries no usage', () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-kimi-fallback-'));
    try {
      const sessionId = 'session-wire-fallback';
      const wireDir = path.join(dataDir, 'sessions', 'workspace-1', sessionId, 'agents', 'agent-1');
      fs.mkdirSync(wireDir, { recursive: true });
      fs.writeFileSync(
        path.join(wireDir, 'wire.jsonl'),
        `${JSON.stringify({
          type: 'usage.record',
          timestamp: '2026-08-08T10:00:00.000Z',
          usage: { inputOther: 80, output: 40, inputCacheRead: 10, inputCacheCreation: 5, total: 125 },
        })}\n`,
        'utf8'
      );

      const event = normalizeKimi(
        {
          hook_event_name: 'PostToolUse',
          session_id: sessionId,
          cwd: '/tmp',
          tool_name: 'Bash',
        },
        { kimiDataDir: dataDir }
      );

      assert.ok(event?.token_usage);
      assert.equal(event!.token_usage!.totalTokens, 125);
      assert.equal(event!.token_usage!.inputTokens, 80);
      assert.equal(event!.token_usage!.outputTokens, 40);
      assert.equal(event!.token_usage!.cacheReadTokens, 10);
      assert.equal(event!.token_usage!.cacheWriteTokens, 5);
      assert.equal(event!.token_usage!.semantics, 'cumulative');
    } finally {
      fs.rmSync(dataDir, { recursive: true, force: true });
    }
  });
});

describe('normalizeClaude', () => {
  it('normalizes PreToolUse with full input', () => {
    const event = normalizeClaude({
      hook_event_name: 'PreToolUse',
      session_id: 'session-c1',
      cwd: '/tmp',
      tool_name: 'Edit',
      tool_input: { file_path: '/tmp/a.ts', old_string: 'a', new_string: 'b' },
    });

    assert.ok(event);
    assert.strictEqual(event!.source, 'claude');
    assert.strictEqual(event!.event_type, 'tool_start');
    assert.strictEqual(event!.tool, 'Edit');
    assert.deepStrictEqual(event!.input, {
      file_path: '/tmp/a.ts',
      old_string: 'a',
      new_string: 'b',
    });
  });

  it('normalizes PostToolUse and wraps string tool_response', () => {
    const event = normalizeClaude({
      hook_event_name: 'PostToolUse',
      session_id: 'session-c1',
      tool_name: 'Read',
      tool_input: { file_path: '/tmp/a.ts' },
      tool_response: 'file contents',
    });

    assert.ok(event);
    assert.strictEqual(event!.event_type, 'tool_end');
    assert.deepStrictEqual(event!.output, { output: 'file contents' });
  });

  it('normalizes session lifecycle events', () => {
    const start = normalizeClaude({
      hook_event_name: 'SessionStart',
      session_id: 'session-c1',
      source: 'startup',
    });
    assert.ok(start);
    assert.strictEqual(start!.event_type, 'session_start');

    const end = normalizeClaude({
      hook_event_name: 'SessionEnd',
      session_id: 'session-c1',
      reason: 'logout',
    });
    assert.ok(end);
    assert.strictEqual(end!.event_type, 'session_end');
    assert.strictEqual(end!.detail, 'logout');
  });

  it('ignores unsupported hook events like Stop and Notification', () => {
    assert.strictEqual(
      normalizeClaude({ hook_event_name: 'Stop', session_id: 's' }),
      undefined
    );
    assert.strictEqual(
      normalizeClaude({ hook_event_name: 'Notification', session_id: 's' }),
      undefined
    );
  });
});

describe('normalizeCodex', () => {
  it('forwards toolInput as input and toolResponse as output', () => {
    const event = normalizeCodex({
      hook_event_name: 'PostToolUse',
      sessionId: 'session-2',
      toolName: 'ReadFile',
      toolInput: { path: '/tmp/foo.txt' },
      toolResponse: { content: 'bar' },
      cwd: '/tmp',
    });

    assert.ok(event);
    assert.strictEqual(event!.event_type, 'tool_end');
    assert.deepStrictEqual(event!.input, { path: '/tmp/foo.txt' });
    assert.deepStrictEqual(event!.output, { content: 'bar' });
    assert.strictEqual(event!.workspacePath, '/tmp');
  });

  it('normalizes snake-case tool fields and wraps string responses', () => {
    const event = normalizeCodex({
      hook_event_name: 'PostToolUse',
      session_id: 'session-snake',
      cwd: '/tmp',
      tool_name: 'ReadFile',
      tool_input: { path: '/tmp/snake.txt' },
      tool_response: 'read complete',
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'ReadFile');
    assert.deepStrictEqual(event!.input, { path: '/tmp/snake.txt' });
    assert.deepStrictEqual(event!.output, { output: 'read complete' });
  });

  it('prefers valid camel-case tool fields over snake-case aliases', () => {
    const event = normalizeCodex({
      hook_event_name: 'PostToolUse',
      sessionId: 'session-alias-precedence',
      cwd: '/tmp',
      toolName: 'WriteFile',
      tool_name: 'ReadFile',
      toolInput: { path: '/tmp/camel.txt' },
      tool_input: { path: '/tmp/snake.txt' },
      toolResponse: { diff: '+camel' },
      tool_response: { diff: '+snake' },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'WriteFile');
    assert.deepStrictEqual(event!.input, { path: '/tmp/camel.txt' });
    assert.deepStrictEqual(event!.output, { diff: '+camel' });
  });

  it('derives safe per-file metadata from apply_patch commands', () => {
    const event = normalizeCodex({
      hook_event_name: 'PreToolUse',
      session_id: 'session-apply-patch',
      cwd: '/tmp',
      tool_name: 'apply_patch',
      tool_input: {
        command: [
          '*** Begin Patch',
          '*** Update File: src/a.ts',
          '+const onlyA = true;',
          '+api_key = "must-not-survive"',
          '*** Add File: src/b.ts',
          '+const onlyB = true;',
          '*** End Patch',
        ].join('\n'),
      },
    });

    assert.ok(event);
    assert.deepStrictEqual(event!.input, {
      operations: [
        {
          path: 'src/a.ts',
          diff: [
            '*** Update File: src/a.ts',
            '+const onlyA = true;',
            '+[redacted sensitive line]',
          ].join('\n'),
        },
        {
          path: 'src/b.ts',
          diff: '*** Add File: src/b.ts\n+const onlyB = true;',
        },
      ],
    });
    assert.equal('command' in event!.input!, false);
    assert.equal(JSON.stringify(event).includes('must-not-survive'), false);
  });

  it('does not parse patch headers for other tools', () => {
    const event = normalizeCodex({
      hook_event_name: 'PreToolUse',
      session_id: 'session-bash',
      cwd: '/tmp',
      tool_name: 'Bash',
      tool_input: { command: '*** Update File: src/a.ts' },
    });

    assert.ok(event);
    assert.deepStrictEqual(event!.input, { command: '*** Update File: src/a.ts' });
  });

  it('preserves the event when optional tool fields are malformed', () => {
    const event = normalizeCodex({
      hook_event_name: 'PreToolUse',
      session_id: 'session-malformed',
      cwd: '/tmp',
      tool_name: 42,
      tool_input: 'not-an-object',
      tool_response: false,
    } as unknown as CodexHookPayload);

    assert.ok(event);
    assert.strictEqual(event!.event_type, 'tool_start');
    assert.strictEqual(event!.tool, undefined);
    assert.strictEqual(event!.input, undefined);
    assert.strictEqual(event!.output, undefined);
  });

  it('normalizes camel-case usage with a deterministic call identifier', () => {
    const event = normalizeCodex({
      hook_event_name: 'Stop',
      sessionId: 'session-codex-usage',
      cwd: '/tmp',
      callId: 'call-1',
      model: 'gpt-test',
      usage: {
        inputTokens: 700,
        outputTokens: 300,
        cachedTokens: 200,
        reasoningTokens: 50,
        totalTokens: 1000,
      },
    });

    assert.ok(event?.token_usage);
    assert.equal(event!.token_usage!.totalTokens, 1000);
    assert.equal(event!.token_usage!.reasoningTokens, 50);
    assert.match(event!.token_usage!.measurementId, /call-1$/);
  });

  it('prefers direct hook usage over transcript fallback usage', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-codex-precedence-'));
    const transcript = path.join(root, 'session.jsonl');
    fs.writeFileSync(
      transcript,
      `${JSON.stringify({
        timestamp: '2026-07-27T10:00:00.000Z',
        type: 'event_msg',
        payload: {
          type: 'token_count',
          info: {
            total_token_usage: {
              total_tokens: 999,
              input_tokens: 900,
              output_tokens: 99,
            },
          },
        },
      })}\n`,
      'utf8'
    );

    try {
      const event = normalizeCodex(
        {
          hook_event_name: 'Stop',
          sessionId: 'session',
          cwd: '/tmp',
          transcriptPath: transcript,
          usage: {
            inputTokens: 700,
            outputTokens: 300,
            totalTokens: 1000,
          },
        },
        { sessionsRoot: root }
      );

      assert.ok(event?.token_usage);
      assert.equal(event!.token_usage!.totalTokens, 1000);
      assert.equal(event!.token_usage!.outputTokens, 300);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('normalizeAgy', () => {
  it('normalizes PreToolUse with tool mapping and detail extraction', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      conversationId: 'conv-1',
      stepIdx: 3,
      toolCall: {
        name: 'run_command',
        args: { CommandLine: 'git status', Cwd: '/tmp' },
      },
    });

    assert.ok(event);
    assert.strictEqual(event!.source, 'agy');
    assert.strictEqual(event!.event_type, 'tool_start');
    assert.strictEqual(event!.session_id, 'conv-1');
    assert.strictEqual(event!.tool, 'Bash');
    assert.strictEqual(event!.detail, 'git status');
    assert.strictEqual(event!.id, 'agy:conv-1:3');
    assert.deepStrictEqual(event!.input, { CommandLine: 'git status', Cwd: '/tmp' });
  });

  it('normalizes PostToolUse without tool name and wraps error', () => {
    const event = normalizeAgy({
      hook_event_name: 'PostToolUse',
      conversationId: 'conv-1',
      stepIdx: 3,
      error: 'exit status 1',
    });

    assert.ok(event);
    assert.strictEqual(event!.event_type, 'tool_end');
    assert.strictEqual(event!.session_id, 'conv-1');
    assert.strictEqual(event!.tool, undefined);
    assert.strictEqual(event!.id, 'agy:conv-1:3');
    assert.deepStrictEqual(event!.output, { error: 'exit status 1' });
  });

  it('maps AGY view_file to Read and extracts AbsolutePath', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      conversationId: 'conv-2',
      stepIdx: 0,
      toolCall: {
        name: 'view_file',
        args: { AbsolutePath: '/home/user/README.md' },
      },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'Read');
    assert.strictEqual(event!.detail, '/home/user/README.md');
  });

  it('ignores unsupported hook event names', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreInvocation',
      conversationId: 'conv-3',
      stepIdx: 0,
    });

    assert.strictEqual(event, undefined);
  });

  it('falls back to sessionId and random id when conversationId is missing', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      sessionId: 'sess-fallback',
      stepIdx: 0,
      toolCall: { name: 'list_dir', args: { DirectoryPath: '/tmp' } },
    });

    assert.ok(event);
    assert.strictEqual(event!.session_id, 'sess-fallback');
    assert.ok(event!.id.startsWith('agy:sess-fallback:'));
    assert.strictEqual(event!.tool, 'Glob');
  });

  it('infers skill from AGY skill file read', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      conversationId: 'conv-skill',
      stepIdx: 0,
      toolCall: {
        name: 'view_file',
        args: {
          AbsolutePath: '/home/user/.agents/skills/crewloop-plan/SKILL.md',
          IsSkillFile: true,
          toolSummary: 'CrewLoop Plan skill',
        },
      },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'Read');
    assert.strictEqual(event!.skill, 'crewloop:plan');
  });

  it('does not infer skill for ordinary AGY file reads', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      conversationId: 'conv-file',
      stepIdx: 0,
      toolCall: {
        name: 'view_file',
        args: { AbsolutePath: '/home/user/README.md' },
      },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'Read');
    assert.strictEqual(event!.skill, undefined);
  });
});
