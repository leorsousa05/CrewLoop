import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectSource, buildEvent, getDefaultSkill, classifyOperation, extractFileDetail } from './shim';
import type { AgentSource, DashboardEvent } from '../types';

describe('detectSource', () => {
  it('detects source from argv', () => {
    assert.equal(detectSource(['node', 'shim', 'kimi']), 'kimi');
    assert.equal(detectSource(['node', 'shim', 'codex']), 'codex');
    assert.equal(detectSource(['node', 'shim', 'claude']), 'claude');
    assert.equal(detectSource(['node', 'shim', 'agy']), 'agy');
  });

  it('falls back to env var', () => {
    process.env.CREWLOOP_DASHBOARD_SOURCE = 'opencode';
    assert.equal(detectSource(['node', 'shim']), 'opencode');
    delete process.env.CREWLOOP_DASHBOARD_SOURCE;
  });

  it('returns undefined when unknown', () => {
    assert.equal(detectSource(['node', 'shim', 'unknown']), undefined);
  });
});

describe('getDefaultSkill', () => {
  it('reads default skill from argv', () => {
    assert.equal(getDefaultSkill(['node', 'shim', 'kimi', '--default-skill', 'crewloop-hub']), 'crewloop-hub');
  });

  it('falls back to env var', () => {
    process.env.CREWLOOP_DEFAULT_SKILL = 'architect';
    assert.equal(getDefaultSkill(['node', 'shim', 'kimi']), 'architect');
    delete process.env.CREWLOOP_DEFAULT_SKILL;
  });

  it('returns undefined when not configured', () => {
    assert.equal(getDefaultSkill(['node', 'shim', 'kimi']), undefined);
  });
});

describe('buildEvent', () => {
  it('builds Kimi PreToolUse event', () => {
    const event = buildEvent('kimi' as AgentSource, {
      hook_event_name: 'PreToolUse',
      session_id: 'sess-1',
      cwd: '/project',
      tool_name: 'Read',
      tool_input: { path: 'README.md' },
    });
    assert.equal(event?.event_type, 'tool_start');
    assert.equal(event?.tool, 'Read');
    assert.equal(event?.detail, 'README.md');
    assert.equal(event?.status, 'running');
  });

  it('builds Kimi PostToolUse event with input and wrapped output', () => {
    const event = buildEvent('kimi' as AgentSource, {
      hook_event_name: 'PostToolUse',
      session_id: 'sess-1',
      cwd: '/project',
      tool_name: 'Read',
      tool_input: { path: 'README.md' },
      tool_output: 'README content',
    });
    assert.equal(event?.event_type, 'tool_end');
    assert.deepEqual(event?.input, { path: 'README.md' });
    assert.deepEqual(event?.output, { output: 'README content' });
  });

  it('builds Codex event', () => {
    const event = buildEvent('codex' as AgentSource, {
      sessionId: 'sess-2',
      toolName: 'Bash',
      toolInput: { command: 'ls' },
      toolResponse: { success: true, durationMs: 5 },
    });
    assert.equal(event?.source, 'codex');
    assert.equal(event?.tool, 'Bash');
    assert.equal(event?.detail, undefined);
    assert.equal(event?.status, 'success');
    assert.equal(event?.duration_ms, 5);
  });

  it('returns undefined for unsupported hook event', () => {
    const event = buildEvent('kimi' as AgentSource, {
      hook_event_name: 'UnknownEvent',
      session_id: 'sess-1',
      cwd: '/project',
    });
    assert.equal(event, undefined);
  });

  it('attaches default skill to session_start events', () => {
    const event = buildEvent(
      'kimi' as AgentSource,
      { hook_event_name: 'SessionStart', session_id: 'sess-1', cwd: '/project' },
      'crewloop-hub'
    );
    assert.equal(event?.event_type, 'session_start');
    assert.equal(event?.skill, 'crewloop-hub');
  });

  it('does not attach default skill to tool events', () => {
    const startEvent = buildEvent(
      'kimi' as AgentSource,
      { hook_event_name: 'PreToolUse', session_id: 'sess-1', cwd: '/project', tool_name: 'Read' },
      'crewloop-hub'
    );
    assert.equal(startEvent?.event_type, 'tool_start');
    assert.equal(startEvent?.skill, undefined);

    const endEvent = buildEvent(
      'kimi' as AgentSource,
      { hook_event_name: 'PostToolUse', session_id: 'sess-1', cwd: '/project', tool_name: 'Read' },
      'crewloop-hub'
    );
    assert.equal(endEvent?.event_type, 'tool_end');
    assert.equal(endEvent?.skill, undefined);
  });

  it('attaches default_skill fallback to tool events of every source', () => {
    const kimi = buildEvent(
      'kimi' as AgentSource,
      { hook_event_name: 'PreToolUse', session_id: 's1', cwd: '/p', tool_name: 'Read' },
      'crewloop-hub'
    );
    assert.equal(kimi?.default_skill, 'crewloop-hub');

    const claude = buildEvent(
      'claude' as AgentSource,
      { hook_event_name: 'PreToolUse', session_id: 's2', tool_name: 'Edit' },
      'crewloop-hub'
    );
    assert.equal(claude?.default_skill, 'crewloop-hub');

    const codex = buildEvent(
      'codex' as AgentSource,
      { hook_event_name: 'PreToolUse', sessionId: 's3', toolName: 'Bash' },
      'crewloop-hub'
    );
    assert.equal(codex?.default_skill, 'crewloop-hub');
  });

  it('does not attach default_skill when the event carries an explicit skill', () => {
    const event = buildEvent(
      'kimi' as AgentSource,
      {
        hook_event_name: 'PreToolUse',
        session_id: 's1',
        cwd: '/p',
        tool_name: 'Read',
        skill: 'architect',
      },
      'crewloop-hub'
    );
    assert.equal(event?.skill, 'architect');
    assert.equal(event?.default_skill, undefined);
  });

  it('maps Codex SessionEnd to session_end', () => {
    const event = buildEvent('codex' as AgentSource, {
      hook_event_name: 'SessionEnd',
      sessionId: 'sess-codex',
    });
    assert.equal(event?.event_type, 'session_end');
  });

  it('forwards explicit payload skill for kimi', () => {
    const event = buildEvent('kimi' as AgentSource, {
      hook_event_name: 'SessionStart',
      session_id: 'sess-1',
      cwd: '/project',
      skill: 'architect',
    });
    assert.equal(event?.skill, 'architect');
  });

  it('forwards explicit payload skill for codex', () => {
    const event = buildEvent('codex' as AgentSource, {
      sessionId: 'sess-2',
      hook_event_name: 'SessionStart',
      skill: 'engineer',
    });
    assert.equal(event?.skill, 'engineer');
  });

  it('preserves AGY detail extracted by the adapter', () => {
    const event = buildEvent('agy' as AgentSource, {
      hook_event_name: 'PreToolUse',
      conversationId: 'sess-agy',
      stepIdx: 0,
      toolCall: {
        name: 'run_command',
        args: { CommandLine: 'git status', Cwd: '/project' },
      },
    });
    assert.equal(event?.source, 'agy');
    assert.equal(event?.tool, 'Bash');
    assert.equal(event?.detail, 'git status');
    assert.equal(event?.status, 'running');
  });

  it('applies default skill fallback to AGY tool events', () => {
    const event = buildEvent(
      'agy' as AgentSource,
      {
        hook_event_name: 'PreToolUse',
        conversationId: 'sess-agy-default',
        stepIdx: 0,
        toolCall: {
          name: 'run_command',
          args: { CommandLine: 'git status', Cwd: '/project' },
        },
      },
      'crewloop-hub'
    );
    assert.equal(event?.event_type, 'tool_start');
    assert.equal(event?.skill, undefined);
    assert.equal(event?.default_skill, 'crewloop-hub');
  });

  it('builds Claude PreToolUse event with operationType and detail', () => {
    const event = buildEvent('claude' as AgentSource, {
      hook_event_name: 'PreToolUse',
      session_id: 'sess-claude',
      cwd: '/project',
      tool_name: 'Edit',
      tool_input: { file_path: 'src/app.ts', old_string: 'a', new_string: 'b' },
    });
    assert.equal(event?.source, 'claude');
    assert.equal(event?.event_type, 'tool_start');
    assert.equal(event?.tool, 'Edit');
    assert.equal(event?.operationType, 'edit');
    assert.equal(event?.detail, 'src/app.ts');
    assert.equal(event?.status, 'running');
  });

  it('builds Claude SessionStart and SessionEnd events', () => {
    const start = buildEvent('claude' as AgentSource, {
      hook_event_name: 'SessionStart',
      session_id: 'sess-claude',
      source: 'startup',
    });
    assert.equal(start?.event_type, 'session_start');

    const end = buildEvent('claude' as AgentSource, {
      hook_event_name: 'SessionEnd',
      session_id: 'sess-claude',
      reason: 'exit',
    });
    assert.equal(end?.event_type, 'session_end');
    assert.equal(end?.detail, 'exit');
  });

  it('classifies operationType on tool events for every source', () => {
    const read = buildEvent('kimi' as AgentSource, {
      hook_event_name: 'PreToolUse',
      session_id: 's',
      cwd: '/p',
      tool_name: 'Read',
      tool_input: { path: 'a.ts' },
    });
    assert.equal(read?.operationType, 'read');

    const edit = buildEvent('agy' as AgentSource, {
      hook_event_name: 'PreToolUse',
      conversationId: 's',
      stepIdx: 0,
      toolCall: { name: 'replace_file_content', args: { TargetFile: '/p/a.ts' } },
    });
    assert.equal(edit?.operationType, 'edit');
    assert.equal(edit?.detail, '/p/a.ts');

    const other = buildEvent('codex' as AgentSource, {
      hook_event_name: 'PreToolUse',
      sessionId: 's',
      toolName: 'Bash',
      toolInput: { command: 'ls' },
    });
    assert.equal(other?.operationType, 'other');
  });

  it('sanitizes dangerous keys out of input and output payloads', () => {
    const event = buildEvent('kimi' as AgentSource, {
      hook_event_name: 'PostToolUse',
      session_id: 'sess-1',
      cwd: '/project',
      tool_name: 'Read',
      tool_input: { path: 'a.ts', api_key: 'sk-secret' },
      tool_output: { content: 'file body', token: 'abc' },
    });
    assert.deepEqual(event?.input, { path: 'a.ts' });
    assert.deepEqual(event?.output, { content: 'file body' });
  });

  it('fills detail from extractFileDetail when sanitize finds no safe key', () => {
    const event = buildEvent('codex' as AgentSource, {
      hook_event_name: 'PreToolUse',
      sessionId: 'sess-2',
      toolName: 'WriteFile',
      toolInput: { filePath: '/repo/index.ts', content: 'x' },
    });
    assert.equal(event?.operationType, 'edit');
    assert.equal(event?.detail, '/repo/index.ts');
  });

  it('prefers AGY inferred skill over default skill fallback', () => {
    const event = buildEvent(
      'agy' as AgentSource,
      {
        hook_event_name: 'PreToolUse',
        conversationId: 'sess-agy-inferred',
        stepIdx: 0,
        toolCall: {
          name: 'view_file',
          args: { AbsolutePath: '/home/arch/.agents/skills/engineer/SKILL.md' },
        },
      },
      'crewloop-hub'
    );
    assert.equal(event?.event_type, 'tool_start');
    assert.equal(event?.tool, 'Read');
    assert.equal(event?.skill, 'engineer');
    assert.equal(event?.default_skill, undefined);
  });
});

describe('classifyOperation', () => {
  it('classifies edit tools from all agents', () => {
    const editTools = [
      'Edit', 'Write', 'MultiEdit', 'NotebookEdit',           // Claude/Kimi
      'WriteFile', 'StrReplaceFile', 'apply_patch',           // Codex
      'write_to_file', 'replace_file_content',                // AGY
      'multi_replace_file_content', 'append_to_file',
    ];
    for (const tool of editTools) {
      assert.equal(classifyOperation(tool), 'edit', `expected ${tool} to be edit`);
    }
  });

  it('classifies read tools from all agents', () => {
    const readTools = [
      'Read', 'Glob', 'Grep',                                 // Claude/Kimi
      'ReadFile', 'read_file', 'search_code',                 // Codex
      'view_file', 'list_dir', 'find_by_name', 'grep_search', // AGY
    ];
    for (const tool of readTools) {
      assert.equal(classifyOperation(tool), 'read', `expected ${tool} to be read`);
    }
  });

  it('classifies everything else as other', () => {
    for (const tool of ['Bash', 'run_command', 'WebSearch', 'Skill', 'Task', 'Unknown']) {
      assert.equal(classifyOperation(tool), 'other', `expected ${tool} to be other`);
    }
  });
});

describe('extractFileDetail', () => {
  it('extracts known path keys per tool signature', () => {
    assert.equal(extractFileDetail('Edit', { file_path: 'src/a.ts' }), 'src/a.ts');
    assert.equal(extractFileDetail('Read', { path: 'README.md' }), 'README.md');
    assert.equal(extractFileDetail('WriteFile', { filePath: '/repo/b.ts' }), '/repo/b.ts');
    assert.equal(extractFileDetail('view_file', { AbsolutePath: '/home/a.md' }), '/home/a.md');
    assert.equal(extractFileDetail('replace_file_content', { TargetFile: '/p/c.ts' }), '/p/c.ts');
  });

  it('extracts paths from nested args and patch operations', () => {
    assert.equal(extractFileDetail('view_file', { args: { AbsolutePath: '/x.ts' } }), '/x.ts');
    assert.equal(
      extractFileDetail('apply_patch', { operations: [{ path: '/repo/patched.ts' }] }),
      '/repo/patched.ts'
    );
  });

  it('returns undefined when no path is present', () => {
    assert.equal(extractFileDetail('Bash', { command: 'ls' }), undefined);
    assert.equal(extractFileDetail('Read', undefined), undefined);
    assert.equal(extractFileDetail(undefined, { file_path: 'a.ts' }), 'a.ts');
  });
});
