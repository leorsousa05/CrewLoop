import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectSource, buildEvent } from './shim';
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

  it('builds Kimi PostToolUse event with status', () => {
    const event = buildEvent('kimi' as AgentSource, {
      hook_event_name: 'PostToolUse',
      session_id: 'sess-1',
      cwd: '/project',
      tool_name: 'Read',
      tool_input: { path: 'README.md' },
      tool_response: { success: true, duration_ms: 12 },
    });
    assert.equal(event?.event_type, 'tool_end');
    assert.equal(event?.status, 'success');
    assert.equal(event?.duration_ms, 12);
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
});
