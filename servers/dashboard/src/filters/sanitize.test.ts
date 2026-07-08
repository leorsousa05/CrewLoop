import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitize, sanitizeEventBoundary, sanitizeToolPayload } from './sanitize';

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
        tool_input: { skill: 'architect' },
      },
      'pre'
    );
    assert.equal(result.detail, 'architect');
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
