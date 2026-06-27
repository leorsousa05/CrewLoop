import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectSource, buildEvent, getDefaultSkill } from './shim';
import type { AgentSource, DashboardEvent } from '../types';

describe('detectSource', () => {
  it('detects source from argv', () => {
    assert.equal(detectSource(['node', 'shim', 'kimi']), 'kimi');
    assert.equal(detectSource(['node', 'shim', 'codex']), 'codex');
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
    assert.equal(getDefaultSkill(['node', 'shim', 'kimi', '--default-skill', 'orchestrator']), 'orchestrator');
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
      'orchestrator'
    );
    assert.equal(event?.event_type, 'session_start');
    assert.equal(event?.skill, 'orchestrator');
  });

  it('does not attach default skill to tool events', () => {
    const startEvent = buildEvent(
      'kimi' as AgentSource,
      { hook_event_name: 'PreToolUse', session_id: 'sess-1', cwd: '/project', tool_name: 'Read' },
      'orchestrator'
    );
    assert.equal(startEvent?.event_type, 'tool_start');
    assert.equal(startEvent?.skill, undefined);

    const endEvent = buildEvent(
      'kimi' as AgentSource,
      { hook_event_name: 'PostToolUse', session_id: 'sess-1', cwd: '/project', tool_name: 'Read' },
      'orchestrator'
    );
    assert.equal(endEvent?.event_type, 'tool_end');
    assert.equal(endEvent?.skill, undefined);
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
      'orchestrator'
    );
    assert.equal(event?.event_type, 'tool_start');
    assert.equal(event?.skill, 'orchestrator');
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
      'orchestrator'
    );
    assert.equal(event?.event_type, 'tool_start');
    assert.equal(event?.tool, 'Read');
    assert.equal(event?.skill, 'engineer');
  });
});
