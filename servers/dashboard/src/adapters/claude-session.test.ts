import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import {
  parseLatestClaudeTokenUsage,
  readClaudeSessionTokenUsage,
} from './claude-session';

const temporaryRoots: string[] = [];

afterEach(() => {
  while (temporaryRoots.length > 0) {
    const root = temporaryRoots.pop();
    if (root) fs.rmSync(root, { recursive: true, force: true });
  }
});

function createProjectsRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-claude-session-'));
  temporaryRoots.push(root);
  return root;
}

function assistantLine(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: 'assistant',
    timestamp: '2026-08-09T14:00:00.000Z',
    message: {
      id: 'msg_synthetic_1',
      role: 'assistant',
      model: 'claude-synthetic',
      content: [{ type: 'text', text: 'sanitized synthetic fixture' }],
      usage: {
        input_tokens: 120,
        output_tokens: 30,
        cache_read_input_tokens: 80,
        cache_creation_input_tokens: 10,
      },
      ...overrides,
    },
  });
}

describe('parseLatestClaudeTokenUsage', () => {
  it('normalizes bounded assistant-message counters with stable identity', () => {
    const line = assistantLine();
    const first = parseLatestClaudeTokenUsage(line, Date.now(), { sessionId: 'session-1' });
    const replay = parseLatestClaudeTokenUsage(line, Date.now(), { sessionId: 'session-1' });

    assert.ok(first);
    assert.equal(first.totalTokens, 240);
    assert.equal(first.cacheReadTokens, 80);
    assert.equal(first.cacheWriteTokens, 10);
    assert.equal(first.semantics, 'delta');
    assert.equal(first.cursorKey, 'claude:assistant-message');
    assert.equal(first.measurementId, replay?.measurementId);
    assert.doesNotMatch(JSON.stringify(first), /synthetic fixture|content|session-1/);
  });

  it('skips malformed, counterless, and oversized transcript lines', () => {
    const malformed = '{"type":"assistant"';
    const counterless = assistantLine({ usage: undefined });
    const oversized = assistantLine({ padding: 'x'.repeat(2048) });

    assert.equal(
      parseLatestClaudeTokenUsage(`${malformed}\n${counterless}`, Date.now(), {
        sessionId: 'session-1',
      }),
      undefined
    );
    assert.equal(
      parseLatestClaudeTokenUsage(oversized, Date.now(), {
        sessionId: 'session-1',
        maxLineBytes: 256,
      }),
      undefined
    );
  });
});

describe('readClaudeSessionTokenUsage', () => {
  it('reads only transcripts contained by the configured projects root', () => {
    const root = createProjectsRoot();
    const transcript = path.join(root, 'project-safe', 'session.jsonl');
    fs.mkdirSync(path.dirname(transcript), { recursive: true });
    fs.writeFileSync(transcript, `${assistantLine()}\n`, 'utf8');

    const measurement = readClaudeSessionTokenUsage({
      transcriptPath: transcript,
      sessionId: 'session-1',
      projectsRoot: root,
    });

    assert.equal(measurement?.totalTokens, 240);
  });

  it('rejects escaped paths, wrong extensions, and symlinks outside the root', (context) => {
    const root = createProjectsRoot();
    const outside = createProjectsRoot();
    const outsideTranscript = path.join(outside, 'outside.jsonl');
    const wrongExtension = path.join(root, 'session.txt');
    const link = path.join(root, 'linked.jsonl');
    fs.writeFileSync(outsideTranscript, assistantLine(), 'utf8');
    fs.writeFileSync(wrongExtension, assistantLine(), 'utf8');

    for (const transcriptPath of [outsideTranscript, wrongExtension]) {
      assert.equal(
        readClaudeSessionTokenUsage({
          transcriptPath,
          sessionId: 'session-1',
          projectsRoot: root,
        }),
        undefined
      );
    }

    try {
      fs.symlinkSync(outsideTranscript, link, 'file');
    } catch {
      context.skip('File symlinks are not available in this environment');
      return;
    }
    assert.equal(
      readClaudeSessionTokenUsage({
        transcriptPath: link,
        sessionId: 'session-1',
        projectsRoot: root,
      }),
      undefined
    );
  });
});
