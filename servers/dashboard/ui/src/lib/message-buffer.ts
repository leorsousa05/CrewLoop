import type {
  ClientRemoveMessage,
  ClientSnapshotMessage,
  ClientUpdateMessage,
} from '../../../src/types';

export type BufferedClientMessage =
  | ClientSnapshotMessage
  | ClientUpdateMessage
  | ClientRemoveMessage;

interface PendingChange {
  sequence: number;
  message: ClientUpdateMessage | ClientRemoveMessage;
}

export interface PendingMessageBuffer {
  snapshot?: ClientSnapshotMessage;
  changes: Map<string, PendingChange>;
  nextSequence: number;
}

export function createPendingMessageBuffer(): PendingMessageBuffer {
  return { changes: new Map(), nextSequence: 0 };
}

export function bufferClientMessage(
  buffer: PendingMessageBuffer,
  message: BufferedClientMessage
): PendingMessageBuffer {
  if (message.type === 'snapshot') {
    return {
      snapshot: message,
      changes: new Map(),
      nextSequence: 0,
    };
  }

  const changes = new Map(buffer.changes);
  changes.set(message.type === 'update' ? message.session.id : message.sessionId, {
    sequence: buffer.nextSequence,
    message,
  });

  return {
    snapshot: buffer.snapshot,
    changes,
    nextSequence: buffer.nextSequence + 1,
  };
}

export function pendingMessageCount(buffer: PendingMessageBuffer): number {
  return (buffer.snapshot ? 1 : 0) + buffer.changes.size;
}

export function flushPendingMessages(buffer: PendingMessageBuffer): BufferedClientMessage[] {
  const changes = Array.from(buffer.changes.values())
    .sort((a, b) => a.sequence - b.sequence)
    .map(({ message }) => message);
  return buffer.snapshot ? [buffer.snapshot, ...changes] : changes;
}
