import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import {
  parseLatestKimiWireUsage,
  readKimiSessionTokenUsage,
} from './kimi-session';

const temporaryRoots: string[] = [];

afterEach(() => {
  while (temporaryRoots.length > 0) {
    const root = temporaryRoots.pop();
    if (root) fs.rmSync(root, { recursive: true, force: true });
  }
});

function createDataDir(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-kimi-session-'));
  temporaryRoots.push(root);
  return root;
}

function usageRecordLine(
  timestamp: string,
  usage: Record<string, unknown>,
  extra: Record<string, unknown> = {}
): string {
  return JSON.stringify({
    type: 'usage.record',
    timestamp,
    usage,
    prompt: 'must-not-leak',
    ...extra,
  });
}

const VALID_USAGE = {
  inputOther: 100,
  output: 50,
  inputCacheRead: 10,
  inputCacheCreation: 5,
  total: 155,
};

describe('parseLatestKimiWireUsage', () => {
  it('normalizes the latest usage record from a JSONL tail', () => {
    const first = usageRecordLine('2026-08-08T10:00:00.000Z', {
      ...VALID_USAGE,
      total: 100,
    });
    const latest = usageRecordLine('2026-08-08T10:01:00.000Z', VALID_USAGE);

    const measurement = parseLatestKimiWireUsage(
      `${first}\n${latest}\n{"type":`,
      Date.now(),
      { sessionId: 'session-1', model: 'kimi-k3' }
    );

    assert.ok(measurement);
    assert.equal(measurement.totalTokens, 155);
    assert.equal(measurement.inputTokens, 100);
    assert.equal(measurement.outputTokens, 50);
    assert.equal(measurement.cacheReadTokens, 10);
    assert.equal(measurement.cacheWriteTokens, 5);
    assert.equal(measurement.semantics, 'cumulative');
    assert.equal(measurement.model, 'kimi-k3');
    assert.equal(measurement.cursorKey, 'kimi:wire:standalone');
    assert.equal(measurement.coverage, 'complete');
  });

  it('returns a stable identifier for duplicate reads', () => {
    const line = usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE);
    const first = parseLatestKimiWireUsage(line, Date.now(), { sessionId: 'session-1' });
    const second = parseLatestKimiWireUsage(line, Date.now(), { sessionId: 'session-1' });

    assert.ok(first);
    assert.equal(first.measurementId, second?.measurementId);
  });

  it('uses the time field when timestamp is missing', () => {
    const line = JSON.stringify({ type: 'usage.record', time: 1784509271784, usage: VALID_USAGE });
    const measurement = parseLatestKimiWireUsage(line, Date.now(), { sessionId: 'session-1' });

    assert.ok(measurement);
    assert.equal(measurement.capturedAt, 1784509271784);
  });

  it('falls back to file mtime when timestamp and time are missing', () => {
    const line = JSON.stringify({ type: 'usage.record', usage: VALID_USAGE });
    const now = Date.now();
    const measurement = parseLatestKimiWireUsage(line, now, { sessionId: 'session-1' });

    assert.ok(measurement);
    assert.equal(measurement.capturedAt, now);
  });

  it('rejects malformed and unsafe counters', () => {
    const invalidValues: unknown[] = [
      -1,
      1.5,
      '150',
      Number.POSITIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ];
    for (const invalid of invalidValues) {
      const line = usageRecordLine('2026-08-08T10:00:00.000Z', {
        ...VALID_USAGE,
        total: invalid,
      });
      assert.equal(
        parseLatestKimiWireUsage(line, Date.now(), { sessionId: 'session-1' }),
        undefined
      );
    }
  });

  it('normalizes usage records that use token_usage instead of usage', () => {
    const line = JSON.stringify({
      type: 'usage.record',
      timestamp: '2026-08-08T10:00:00.000Z',
      token_usage: {
        input_other: 80,
        output: 40,
        input_cache_read: 10,
        input_cache_creation: 5,
        total: 125,
      },
    });

    const measurement = parseLatestKimiWireUsage(line, Date.now(), { sessionId: 'session-1' });
    assert.ok(measurement);
    assert.equal(measurement.totalTokens, 125);
    assert.equal(measurement.inputTokens, 80);
    assert.equal(measurement.outputTokens, 40);
    assert.equal(measurement.cacheReadTokens, 10);
    assert.equal(measurement.cacheWriteTokens, 5);
  });

  it('extracts model from the usage record when input model is not provided', () => {
    const line = JSON.stringify({
      type: 'usage.record',
      time: 1784509271784,
      model: 'kimi-code/k3',
      usage: VALID_USAGE,
    });

    const measurement = parseLatestKimiWireUsage(line, Date.now(), { sessionId: 'session-1' });
    assert.ok(measurement);
    assert.equal(measurement.model, 'kimi-code/k3');
  });

  it('does not expose raw wire content or unrelated fields', () => {
    const line = usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE);
    const serialized = JSON.stringify(
      parseLatestKimiWireUsage(line, Date.now(), { sessionId: 'session-1' })
    );

    assert.doesNotMatch(serialized, /must-not-leak|prompt/);
  });

  it('ignores lines larger than the configured limit', () => {
    const line = usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE, {
      padding: 'x'.repeat(1024),
    });
    assert.equal(
      parseLatestKimiWireUsage(line, Date.now(), {
        sessionId: 'session-1',
        maxLineBytes: 100,
      }),
      undefined
    );
  });
});

describe('readKimiSessionTokenUsage', () => {
  it('reads a valid wire file inside the data dir', () => {
    const root = createDataDir();
    const sessionDir = path.join(root, 'sessions', 'workspace-1', 'session-1', 'agents', 'agent-1');
    fs.mkdirSync(sessionDir, { recursive: true });
    const wirePath = path.join(sessionDir, 'wire.jsonl');
    fs.writeFileSync(wirePath, `${usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE)}\n`, 'utf8');

    const measurement = readKimiSessionTokenUsage({
      sessionId: 'session-1',
      kimiDataDir: root,
    });

    assert.equal(measurement[0]?.totalTokens, 155);
  });

  it('matches wire files when the directory has a session_ prefix but the hook id does not', () => {
    const root = createDataDir();
    const sessionId = '36c672d8-a308-4a2e-b712-e1bfa6de90c7';
    const sessionDir = path.join(root, 'sessions', 'workspace-1', `session_${sessionId}`, 'agents', 'main');
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(
      path.join(sessionDir, 'wire.jsonl'),
      `${JSON.stringify({ type: 'usage.record', time: 1784509271784, usage: VALID_USAGE })}\n`,
      'utf8'
    );

    const measurement = readKimiSessionTokenUsage({
      sessionId,
      kimiDataDir: root,
    });

    assert.equal(measurement[0]?.totalTokens, 155);
    assert.equal(measurement[0]?.capturedAt, 1784509271784);
  });

  it('returns every contained wire stream with independent replay-stable cursors', () => {
    const root = createDataDir();
    const agent1Dir = path.join(root, 'sessions', 'workspace-1', 'session-1', 'agents', 'agent-1');
    const agent2Dir = path.join(root, 'sessions', 'workspace-1', 'session-1', 'agents', 'agent-2');
    fs.mkdirSync(agent1Dir, { recursive: true });
    fs.mkdirSync(agent2Dir, { recursive: true });

    const wire1 = path.join(agent1Dir, 'wire.jsonl');
    const wire2 = path.join(agent2Dir, 'wire.jsonl');

    fs.writeFileSync(wire1, `${usageRecordLine('2026-08-08T10:00:00.000Z', { ...VALID_USAGE, total: 100 })}\n`, 'utf8');
    fs.writeFileSync(wire2, `${usageRecordLine('2026-08-08T10:01:00.000Z', VALID_USAGE)}\n`, 'utf8');
    fs.utimesSync(wire1, new Date('2026-08-08T09:00:00.000Z'), new Date('2026-08-08T09:00:00.000Z'));
    fs.utimesSync(wire2, new Date('2026-08-08T10:00:00.000Z'), new Date('2026-08-08T10:00:00.000Z'));

    const measurement = readKimiSessionTokenUsage({
      sessionId: 'session-1',
      kimiDataDir: root,
    });

    const replay = readKimiSessionTokenUsage({
      sessionId: 'session-1',
      kimiDataDir: root,
    });

    assert.equal(measurement.reduce((sum, value) => sum + value.totalTokens, 0), 255);
    assert.equal(new Set(measurement.map((value) => value.cursorKey)).size, 2);
    assert.equal(measurement.every((value) => value.coverage === 'complete'), true);
    assert.deepEqual(
      measurement.map((value) => value.measurementId),
      replay.map((value) => value.measurementId)
    );
    assert.doesNotMatch(JSON.stringify(measurement), /session-1|workspace-1|agent-1/);
  });

  it('marks readable wire coverage partial when another wire has no counters', () => {
    const root = createDataDir();
    const validDir = path.join(root, 'sessions', 'workspace-1', 'session-1', 'agents', 'agent-1');
    const invalidDir = path.join(root, 'sessions', 'workspace-1', 'session-1', 'agents', 'agent-2');
    fs.mkdirSync(validDir, { recursive: true });
    fs.mkdirSync(invalidDir, { recursive: true });
    fs.writeFileSync(
      path.join(validDir, 'wire.jsonl'),
      `${usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE)}\n`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(invalidDir, 'wire.jsonl'),
      `${JSON.stringify({ type: 'usage.record', usage: { total: 'invalid' } })}\n`,
      'utf8'
    );

    const measurement = readKimiSessionTokenUsage({
      sessionId: 'session-1',
      kimiDataDir: root,
    });

    assert.equal(measurement[0]?.totalTokens, 155);
    assert.equal(measurement[0]?.coverage, 'partial');
  });

  it('returns unavailable for missing usage records and files', () => {
    const root = createDataDir();
    const sessionDir = path.join(root, 'sessions', 'workspace-1', 'session-1', 'agents', 'agent-1');
    fs.mkdirSync(sessionDir, { recursive: true });
    const wirePath = path.join(sessionDir, 'wire.jsonl');
    fs.writeFileSync(wirePath, `${JSON.stringify({ type: 'other.record' })}\n`, 'utf8');

    assert.deepEqual(
      readKimiSessionTokenUsage({
        sessionId: 'session-1',
        kimiDataDir: root,
      }),
      []
    );
    assert.deepEqual(
      readKimiSessionTokenUsage({
        sessionId: 'session-missing',
        kimiDataDir: root,
      }),
      []
    );
  });

  it('rejects wrong filenames and paths outside the data dir', () => {
    const root = createDataDir();
    const outsideRoot = createDataDir();
    const sessionDir = path.join(root, 'sessions', 'workspace-1', 'session-1');
    fs.mkdirSync(sessionDir, { recursive: true });

    const wrongName = path.join(sessionDir, 'wire.txt');
    const outsideWire = path.join(outsideRoot, 'wire.jsonl');
    fs.writeFileSync(wrongName, usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE));
    fs.writeFileSync(outsideWire, usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE));

    for (const wirePath of [wrongName, outsideWire, path.join(root, '..', 'escape.jsonl')]) {
      assert.deepEqual(
        readKimiSessionTokenUsage({
          sessionId: 'session-1',
          kimiDataDir: root,
        }),
        []
      );
    }
  });

  it('rejects a symlink that escapes the data dir', (context) => {
    const root = createDataDir();
    const outsideRoot = createDataDir();
    const sessionDir = path.join(root, 'sessions', 'workspace-1', 'session-1');
    fs.mkdirSync(sessionDir, { recursive: true });
    const outsideWire = path.join(outsideRoot, 'wire.jsonl');
    const link = path.join(sessionDir, 'wire.jsonl');
    fs.writeFileSync(outsideWire, usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE));

    try {
      fs.symlinkSync(outsideWire, link, 'file');
    } catch {
      context.skip('File symlinks are not available in this environment');
      return;
    }

    assert.deepEqual(
      readKimiSessionTokenUsage({
        sessionId: 'session-1',
        kimiDataDir: root,
      }),
      []
    );
  });

  it('skips discovery for unknown session ids', () => {
    assert.deepEqual(
      readKimiSessionTokenUsage({
        sessionId: 'unknown',
        kimiDataDir: createDataDir(),
      }),
      []
    );
  });

  it('uses KIMI_DATA_DIR from environment when no override is provided', () => {
    const root = createDataDir();
    const sessionDir = path.join(root, 'sessions', 'workspace-1', 'session-env', 'agents', 'agent-1');
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(
      path.join(sessionDir, 'wire.jsonl'),
      `${usageRecordLine('2026-08-08T10:00:00.000Z', VALID_USAGE)}\n`,
      'utf8'
    );

    const original = process.env.KIMI_DATA_DIR;
    process.env.KIMI_DATA_DIR = root;
    try {
      const measurement = readKimiSessionTokenUsage({ sessionId: 'session-env' });
      assert.equal(measurement[0]?.totalTokens, 155);
    } finally {
      if (original === undefined) {
        delete process.env.KIMI_DATA_DIR;
      } else {
        process.env.KIMI_DATA_DIR = original;
      }
    }
  });
});
