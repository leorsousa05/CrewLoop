import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import {
  parseLatestCodexTokenUsage,
  readCodexSessionTokenUsage,
} from './codex-session';

const temporaryRoots: string[] = [];

afterEach(() => {
  while (temporaryRoots.length > 0) {
    const root = temporaryRoots.pop();
    if (root) fs.rmSync(root, { recursive: true, force: true });
  }
});

function createSessionsRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-codex-session-'));
  temporaryRoots.push(root);
  return root;
}

function tokenCountLine(
  timestamp: string,
  usage: Record<string, unknown>,
  extra: Record<string, unknown> = {}
): string {
  return JSON.stringify({
    timestamp,
    type: 'event_msg',
    payload: {
      type: 'token_count',
      info: {
        total_token_usage: usage,
        rate_limits: { access_token: 'must-not-leak' },
        ...extra,
      },
      prompt: 'must-not-leak',
    },
  });
}

const VALID_USAGE = {
  input_tokens: 120,
  cached_input_tokens: 40,
  output_tokens: 30,
  reasoning_output_tokens: 10,
  total_tokens: 150,
};

describe('parseLatestCodexTokenUsage', () => {
  it('normalizes the latest complete cumulative token-count event', () => {
    const first = tokenCountLine('2026-07-27T10:00:00.000Z', {
      ...VALID_USAGE,
      total_tokens: 100,
    });
    const latest = tokenCountLine('2026-07-27T10:01:00.000Z', VALID_USAGE);

    const measurement = parseLatestCodexTokenUsage(
      `${first}\n${latest}\n{"timestamp":`,
      { sessionId: 'session-1', model: 'gpt-test' }
    );

    assert.ok(measurement);
    assert.equal(measurement.totalTokens, 150);
    assert.equal(measurement.cacheReadTokens, 40);
    assert.equal(measurement.reasoningTokens, 10);
    assert.equal(measurement.semantics, 'cumulative');
    assert.equal(measurement.model, 'gpt-test');
    assert.equal(measurement.cursorKey, 'codex:session-transcript');
    assert.equal(measurement.coverage, 'complete');
    assert.doesNotMatch(measurement.measurementId, /session-1/);
  });

  it('returns a stable identifier for duplicate reads', () => {
    const line = tokenCountLine('2026-07-27T10:00:00.000Z', VALID_USAGE);
    const first = parseLatestCodexTokenUsage(line, { sessionId: 'session-1' });
    const second = parseLatestCodexTokenUsage(line, { sessionId: 'session-1' });

    assert.ok(first);
    assert.equal(first.measurementId, second?.measurementId);
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
      const line = tokenCountLine('2026-07-27T10:00:00.000Z', {
        ...VALID_USAGE,
        total_tokens: invalid,
      });
      assert.equal(
        parseLatestCodexTokenUsage(line, { sessionId: 'session-1' }),
        undefined
      );
    }
  });

  it('does not expose transcript content or rate-limit metadata', () => {
    const line = tokenCountLine('2026-07-27T10:00:00.000Z', VALID_USAGE);
    const serialized = JSON.stringify(
      parseLatestCodexTokenUsage(line, { sessionId: 'session-1' })
    );

    assert.doesNotMatch(serialized, /must-not-leak|rate_limits|prompt/);
  });

  it('ignores lines larger than the configured limit', () => {
    const line = tokenCountLine('2026-07-27T10:00:00.000Z', VALID_USAGE, {
      padding: 'x'.repeat(1024),
    });
    assert.equal(
      parseLatestCodexTokenUsage(line, { sessionId: 'session-1', maxLineBytes: 100 }),
      undefined
    );
  });
});

describe('readCodexSessionTokenUsage', () => {
  it('reads a valid transcript inside the configured sessions root', () => {
    const root = createSessionsRoot();
    const transcript = path.join(root, 'session.jsonl');
    fs.writeFileSync(
      transcript,
      `${tokenCountLine('2026-07-27T10:00:00.000Z', VALID_USAGE)}\n`,
      'utf8'
    );

    const measurement = readCodexSessionTokenUsage({
      transcriptPath: transcript,
      sessionId: 'session-1',
      sessionsRoot: root,
    });

    assert.equal(measurement?.totalTokens, 150);
  });

  it('returns unavailable for missing token-count events and files', () => {
    const root = createSessionsRoot();
    const transcript = path.join(root, 'session.jsonl');
    fs.writeFileSync(transcript, `${JSON.stringify({ type: 'event_msg' })}\n`, 'utf8');

    assert.equal(
      readCodexSessionTokenUsage({
        transcriptPath: transcript,
        sessionId: 'session-1',
        sessionsRoot: root,
      }),
      undefined
    );
    assert.equal(
      readCodexSessionTokenUsage({
        transcriptPath: path.join(root, 'missing.jsonl'),
        sessionId: 'session-1',
        sessionsRoot: root,
      }),
      undefined
    );
  });

  it('rejects wrong extensions and paths outside the sessions root', () => {
    const root = createSessionsRoot();
    const outsideRoot = createSessionsRoot();
    const wrongExtension = path.join(root, 'session.txt');
    const outsideTranscript = path.join(outsideRoot, 'session.jsonl');
    fs.writeFileSync(wrongExtension, tokenCountLine('2026-07-27T10:00:00.000Z', VALID_USAGE));
    fs.writeFileSync(outsideTranscript, tokenCountLine('2026-07-27T10:00:00.000Z', VALID_USAGE));

    for (const transcriptPath of [wrongExtension, outsideTranscript, path.join(root, '..', 'escape.jsonl')]) {
      assert.equal(
        readCodexSessionTokenUsage({
          transcriptPath,
          sessionId: 'session-1',
          sessionsRoot: root,
        }),
        undefined
      );
    }
  });

  it('rejects a symlink that escapes the sessions root', (context) => {
    const root = createSessionsRoot();
    const outsideRoot = createSessionsRoot();
    const outsideTranscript = path.join(outsideRoot, 'outside.jsonl');
    const link = path.join(root, 'linked.jsonl');
    fs.writeFileSync(outsideTranscript, tokenCountLine('2026-07-27T10:00:00.000Z', VALID_USAGE));

    try {
      fs.symlinkSync(outsideTranscript, link, 'file');
    } catch {
      context.skip('File symlinks are not available in this environment');
      return;
    }

    assert.equal(
      readCodexSessionTokenUsage({
        transcriptPath: link,
        sessionId: 'session-1',
        sessionsRoot: root,
      }),
      undefined
    );
  });
});
