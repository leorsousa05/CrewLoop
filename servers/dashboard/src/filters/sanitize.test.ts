import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitize, sanitizeEventBoundary } from './sanitize';

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
