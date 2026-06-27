import { describe, it } from 'node:test';
import assert from 'node:assert';
import { projectInvocations } from './invocations';
import type { ClientEvent } from '../types';

function makeEvent(overrides: Partial<ClientEvent> & { id: string }): ClientEvent {
  return {
    timestamp: Date.now(),
    event_type: 'tool_start',
    ...overrides,
  } as ClientEvent;
}

describe('projectInvocations', () => {
  it('pairs tool_start and tool_end by id when tool names differ or are missing', () => {
    const start = makeEvent({
      id: 'agy:conv-1:0',
      event_type: 'tool_start',
      tool: 'Bash',
      detail: 'git status',
    });
    const end = makeEvent({
      id: 'agy:conv-1:0',
      event_type: 'tool_end',
      status: 'success',
      output: { result: 'ok' },
    });

    const invocations = projectInvocations([end, start]);
    assert.strictEqual(invocations.length, 1);
    assert.strictEqual(invocations[0].tool, 'Bash');
    assert.strictEqual(invocations[0].status, 'success');
    assert.strictEqual(invocations[0].detail, 'git status');
    assert.deepStrictEqual(invocations[0].output, { result: 'ok' });
  });

  it('falls back to tool-name pairing when ids do not match', () => {
    const start = makeEvent({
      id: 'kimi-1',
      event_type: 'tool_start',
      tool: 'Read',
      detail: '/tmp/foo.txt',
    });
    const end = makeEvent({
      id: 'kimi-2',
      event_type: 'tool_end',
      tool: 'Read',
      status: 'success',
    });

    const invocations = projectInvocations([end, start]);
    assert.strictEqual(invocations.length, 1);
    assert.strictEqual(invocations[0].tool, 'Read');
    assert.strictEqual(invocations[0].status, 'success');
  });

  it('renders orphaned tool_end when no matching start exists', () => {
    const end = makeEvent({
      id: 'agy:conv-1:5',
      event_type: 'tool_end',
      status: 'error',
      output: { error: 'failed' },
    });

    const invocations = projectInvocations([end]);
    assert.strictEqual(invocations.length, 1);
    assert.strictEqual(invocations[0].eventType, 'tool_end');
    assert.strictEqual(invocations[0].status, 'error');
  });
});
