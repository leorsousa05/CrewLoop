import { describe, expect, it } from 'vitest';
import type { ClientSession } from '../../../src/types';
import {
  bufferClientMessage,
  createPendingMessageBuffer,
  flushPendingMessages,
  pendingMessageCount,
} from './message-buffer';

function session(id: string): ClientSession {
  return {
    id,
    source: 'codex',
    lifecycle: 'running',
    events: [],
    startTime: 1,
    lastActivity: 1,
    toolCounts: {},
  };
}

describe('pending message buffer', () => {
  it('coalesces repeated updates by session and keeps memory bounded', () => {
    let buffer = createPendingMessageBuffer();
    buffer = bufferClientMessage(buffer, { type: 'update', session: session('a'), isActive: false });
    buffer = bufferClientMessage(buffer, {
      type: 'update',
      session: { ...session('a'), lastActivity: 2 },
      isActive: true,
    });

    expect(pendingMessageCount(buffer)).toBe(1);
    expect(flushPendingMessages(buffer)).toEqual([
      { type: 'update', session: { ...session('a'), lastActivity: 2 }, isActive: true },
    ]);
  });

  it('replaces older buffered messages when a snapshot arrives', () => {
    let buffer = createPendingMessageBuffer();
    buffer = bufferClientMessage(buffer, { type: 'update', session: session('old'), isActive: false });
    buffer = bufferClientMessage(buffer, { type: 'snapshot', sessions: [session('new')] });

    expect(pendingMessageCount(buffer)).toBe(1);
    expect(flushPendingMessages(buffer)).toEqual([{ type: 'snapshot', sessions: [session('new')] }]);
  });

  it('preserves latest cross-session update/remove ordering', () => {
    let buffer = createPendingMessageBuffer();
    buffer = bufferClientMessage(buffer, { type: 'update', session: session('a'), isActive: false });
    buffer = bufferClientMessage(buffer, { type: 'remove', sessionId: 'a', reason: 'pruned' });
    buffer = bufferClientMessage(buffer, { type: 'update', session: session('b'), isActive: false });

    expect(flushPendingMessages(buffer).map((message) =>
      message.type === 'update' ? message.session.id : message.type === 'remove' ? message.sessionId : 'snapshot'
    ))
      .toEqual(['a', 'b']);
    expect(flushPendingMessages(buffer)[0]).toEqual({ type: 'remove', sessionId: 'a', reason: 'pruned' });
  });
});
