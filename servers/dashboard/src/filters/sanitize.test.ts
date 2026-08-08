import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitize,
  sanitizeEventBoundary,
  sanitizeToolInputPayload,
  sanitizeToolPayload,
} from './sanitize';

describe('sanitize', () => {
  it('extracts safe path details', () => {
    const result = sanitize(
      {
        tool_name: 'Read',
        tool_input: { path: 'README.md' },
      },
      'pre'
    );
    assert.equal(result.detail, 'README.md');
    assert.equal(result.status, 'running');
  });

  it('extracts skill name from Skill tool input', () => {
    const result = sanitize(
      {
        tool_name: 'Skill',
        tool_input: { skill: 'crewloop:plan' },
      },
      'pre'
    );
    assert.equal(result.detail, 'crewloop:plan');
  });

  it('strips dangerous command input', () => {
    const result = sanitize(
      {
        tool_name: 'Bash',
        tool_input: { command: 'rm -rf /' },
      },
      'pre'
    );
    assert.equal(result.detail, undefined);
    assert.equal(result.status, 'running');
  });

  it('strips content/text input', () => {
    const result = sanitize(
      {
        tool_name: 'Write',
        tool_input: { path: 'secret.env', content: 'API_KEY=123' },
      },
      'pre'
    );
    assert.equal(result.detail, 'secret.env');
  });

  it('marks success on post event', () => {
    const result = sanitize(
      {
        tool_name: 'Read',
        tool_input: { path: 'README.md' },
        tool_response: { success: true, duration_ms: 12 },
      },
      'post'
    );
    assert.equal(result.status, 'success');
    assert.equal(result.duration_ms, 12);
  });

  it('marks error on post event', () => {
    const result = sanitize(
      {
        tool_name: 'Bash',
        tool_response: { success: false, durationMs: 45 },
      },
      'post'
    );
    assert.equal(result.status, 'error');
    assert.equal(result.duration_ms, 45);
  });

  it('extracts hostname from safe url input', () => {
    const result = sanitize(
      {
        tool_name: 'FetchURL',
        tool_input: { url: 'https://example.com/path' },
      },
      'pre'
    );
    assert.equal(result.detail, 'example.com');
    assert.equal(result.status, 'running');
  });

  it('rejects events with dangerous keys at boundary', () => {
    assert.equal(sanitizeEventBoundary({ command: 'ls' }), false);
    assert.equal(sanitizeEventBoundary({ token: 'abc' }), false);
    assert.equal(sanitizeEventBoundary({ path: 'README.md' }), true);
  });
});

describe('sanitizeToolPayload', () => {
  it('preserves code, diffs, and snippets needed by the UI', () => {
    const payload = {
      file_path: 'src/app.ts',
      content: 'export const x = 1;\n',
      diff: '- old line\n+ new line\n',
      snippet: 'const y = 2;',
      query: 'TODO',
    };
    assert.deepEqual(sanitizeToolPayload(payload), payload);
  });

  it('removes dangerous keys recursively', () => {
    const result = sanitizeToolPayload({
      file_path: 'src/app.ts',
      api_key: 'sk-123',
      nested: {
        token: 'abc',
        Authorization: 'Bearer xyz',
        keep: 'me',
        deeper: { password: 'hunter2', ok: true },
      },
    });
    assert.deepEqual(result, {
      file_path: 'src/app.ts',
      nested: { keep: 'me', deeper: { ok: true } },
    });
  });

  it('truncates long base64 strings', () => {
    const blob = 'A'.repeat(2000);
    const result = sanitizeToolPayload({ image: blob });
    const image = result?.image as string;
    assert.ok(image.length < blob.length);
    assert.ok(image.includes('[truncated'));
  });

  it('does not base64-truncate safe keys like content', () => {
    const content = 'A'.repeat(2000); // base64-looking but under the hard cap
    const result = sanitizeToolPayload({ content });
    assert.equal(result?.content, content);
  });

  it('applies the hard length cap even to safe keys', () => {
    const content = 'x'.repeat(10000);
    const result = sanitizeToolPayload({ content });
    const value = result?.content as string;
    assert.ok(value.length < content.length);
    assert.ok(value.includes('[truncated'));
  });

  it('wraps string payloads', () => {
    assert.deepEqual(sanitizeToolPayload('hello'), { output: 'hello' });
  });

  it('returns undefined for null/undefined payloads', () => {
    assert.equal(sanitizeToolPayload(undefined), undefined);
    assert.equal(sanitizeToolPayload(null), undefined);
  });

  it('never throws on pathological payloads', () => {
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;
    const result = sanitizeToolPayload(cyclic);
    assert.equal(result?.a, 1);
  });
});

describe('sanitizeToolInputPayload', () => {
  it('removes dangerous input keys recursively while preserving paths', () => {
    const result = sanitizeToolInputPayload({
      path: 'src/app.ts',
      command: 'apply patch',
      content: 'file body',
      nested: {
        code: 'secret code',
        prompt: 'secret prompt',
        token: 'secret token',
        args: { file_path: 'src/nested.ts' },
      },
      operations: [{ path: 'src/other.ts', password: 'secret' }],
    });

    assert.deepEqual(result, {
      path: 'src/app.ts',
      nested: { args: { file_path: 'src/nested.ts' } },
      operations: [{ path: 'src/other.ts' }],
    });
  });

  it('returns undefined when sanitization removes every field', () => {
    assert.equal(
      sanitizeToolInputPayload({
        command: 'ls',
        content: 'body',
        nested: { token: 'secret' },
      }),
      undefined
    );
    assert.equal(sanitizeToolInputPayload('not-an-object'), undefined);
  });

  it('preserves only already-derived operation paths and redacted diffs', () => {
    const result = sanitizeToolInputPayload({
      command: 'raw patch must be removed',
      operations: [
        {
          path: 'src/a.ts',
          diff: '*** Update File: src/a.ts\n+[redacted sensitive line]',
          token: 'raw token',
        },
      ],
    });

    assert.deepEqual(result, {
      operations: [
        {
          path: 'src/a.ts',
          diff: '*** Update File: src/a.ts\n+[redacted sensitive line]',
        },
      ],
    });
    assert.equal(JSON.stringify(result).includes('raw patch'), false);
    assert.equal(JSON.stringify(result).includes('raw token'), false);
  });

  it('revalidates untrusted operation diffs before storage', () => {
    const result = sanitizeToolInputPayload({
      operations: [
        {
          path: 'src/config.ts',
          diff: [
            '*** Update File: src/config.ts',
            '+API_KEY=raw-secret',
            '+export const safe = true;',
          ].join('\n'),
        },
        {
          path: '.env',
          diff: '*** Update File: .env\n+DB_PASSWORD=raw-password',
        },
      ],
    });

    assert.deepEqual(result, {
      operations: [
        {
          path: 'src/config.ts',
          diff: [
            '*** Update File: src/config.ts',
            '+[redacted sensitive line]',
            '+export const safe = true;',
          ].join('\n'),
        },
        { path: '.env' },
      ],
    });
    assert.equal(JSON.stringify(result).includes('raw-secret'), false);
    assert.equal(JSON.stringify(result).includes('raw-password'), false);
  });

  it('reapplies per-file and aggregate budgets to untrusted operation diffs', () => {
    const operations = Array.from({ length: 10 }, (_, index) => ({
      path: `src/file-${index}.ts`,
      diff: [
        `*** Update File: src/file-${index}.ts`,
        ...Array.from({ length: 100 }, () => `+${String(index).repeat(80)}`),
      ].join('\n'),
    }));

    const result = sanitizeToolInputPayload({ operations });
    const safeOperations = result?.operations as Array<{
      path: string;
      diff?: string;
    }>;
    const totalLength = safeOperations.reduce(
      (total, operation) => total + (operation.diff?.length || 0),
      0
    );

    assert.ok(safeOperations.every((operation) => !operation.diff || operation.diff.length <= 8000));
    assert.ok(totalLength <= 64 * 1024);
    assert.equal(safeOperations.at(-1)?.diff, undefined);

    const capped = sanitizeToolInputPayload({
      operations: Array.from({ length: 101 }, (_, index) => ({
        path: `src/capped-${index}.ts`,
      })),
    });
    assert.equal((capped?.operations as unknown[]).length, 100);
  });
});
