import { describe, it } from 'node:test';
import assert from 'node:assert';
import { normalizeKimi } from '../adapters/kimi';
import { normalizeCodex } from '../adapters/codex';
import { normalizeAgy } from '../adapters/agy';

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
});

describe('normalizeCodex', () => {
  it('forwards toolInput as input and toolResponse as output', () => {
    const event = normalizeCodex({
      hook_event_name: 'PostToolUse',
      sessionId: 'session-2',
      toolName: 'ReadFile',
      toolInput: { path: '/tmp/foo.txt' },
      toolResponse: { content: 'bar' },
    });

    assert.ok(event);
    assert.strictEqual(event!.event_type, 'tool_end');
    assert.deepStrictEqual(event!.input, { path: '/tmp/foo.txt' });
    assert.deepStrictEqual(event!.output, { content: 'bar' });
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
          AbsolutePath: '/home/arch/.agents/skills/orchestrator/SKILL.md',
          IsSkillFile: true,
          toolSummary: 'Orchestrator skill',
        },
      },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'Read');
    assert.strictEqual(event!.skill, 'orchestrator');
  });

  it('does not infer skill for ordinary AGY file reads', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      conversationId: 'conv-file',
      stepIdx: 0,
      toolCall: {
        name: 'view_file',
        args: { AbsolutePath: '/home/arch/README.md' },
      },
    });

    assert.ok(event);
    assert.strictEqual(event!.tool, 'Read');
    assert.strictEqual(event!.skill, undefined);
  });

  it('infers skill from Windows-style skill file path', () => {
    const event = normalizeAgy({
      hook_event_name: 'PreToolUse',
      conversationId: 'conv-win',
      stepIdx: 0,
      toolCall: {
        name: 'view_file',
        args: { AbsolutePath: 'C:\\Users\\arch\\.agents\\skills\\engineer\\SKILL.md' },
      },
    });

    assert.ok(event);
    assert.strictEqual(event!.skill, 'engineer');
  });
});
