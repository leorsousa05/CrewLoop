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

  it('truncates command input for Bash detail and input', () => {
    const longCommand = `rm -rf /very/long/path/that/needs/truncation/and/keeps/going/past/the/eighty/character/limit/abc`;
    const result = sanitize(
      {
        tool_name: 'Bash',
        tool_input: { command: longCommand },
      },
      'pre'
    );
    assert.equal(result.detail, longCommand.slice(0, 80) + '…');
    assert.ok(result.input);
    assert.equal((result.input as Record<string, unknown>).command, result.detail);
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
    assert.ok(result.input);
    assert.equal((result.input as Record<string, unknown>).path, 'secret.env');
    assert.equal((result.input as Record<string, unknown>).content, undefined);
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

  it('returns safe input payload copy', () => {
    const result = sanitize(
      {
        tool_name: 'Read',
        tool_input: { path: 'README.md', cwd: '/home/user' },
      },
      'pre'
    );
    assert.deepEqual(result.input, { path: 'README.md', cwd: '/home/user' });
  });

  it('returns safe output payload copy', () => {
    const result = sanitize(
      {
        tool_name: 'Read',
        tool_input: { path: 'README.md' },
        tool_response: { success: true, diff: '+added line', content: 'SECRET' },
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).success, true);
    assert.equal((result.output as Record<string, unknown>).diff, '+added line');
    assert.equal((result.output as Record<string, unknown>).content, undefined);
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'SECRET');
  });

  it('truncates content snippet in output', () => {
    const longContent = 'a'.repeat(500);
    const result = sanitize(
      {
        tool_name: 'Write',
        tool_input: { path: 'src/index.ts' },
        tool_response: { success: true, content: longContent },
      },
      'post'
    );
    assert.ok(result.output);
    const snippet = (result.output as Record<string, unknown>).contentSnippet as string;
    assert.ok(snippet.endsWith('…'));
    assert.ok(snippet.length <= 481);
  });

  it('creates contentSnippet for Write tools from tool_input.content', () => {
    const result = sanitize(
      {
        tool_name: 'Write',
        tool_input: { path: 'src/index.ts', content: 'export const x = 1;' },
        tool_response: { success: true },
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'export const x = 1;');
    assert.equal((result.output as Record<string, unknown>).diff, undefined);
  });

  it('creates diff for Edit tools from old_string and new_string', () => {
    const result = sanitize(
      {
        tool_name: 'Edit',
        tool_input: {
          path: 'src/index.ts',
          old_string: 'const x = 1;',
          new_string: 'const x = 2;',
        },
        tool_response: { success: true },
      },
      'post'
    );
    assert.ok(result.output);
    const diff = (result.output as Record<string, unknown>).diff as string;
    assert.ok(diff.includes('- const x = 1;'));
    assert.ok(diff.includes('+ const x = 2;'));
  });

  it('creates diff for EditFile tools', () => {
    const result = sanitize(
      {
        tool_name: 'EditFile',
        tool_input: {
          path: 'src/index.ts',
          old_string: 'old',
          new_string: 'new',
        },
        tool_response: { success: true },
      },
      'post'
    );
    assert.ok(result.output);
    const diff = (result.output as Record<string, unknown>).diff as string;
    assert.ok(diff.includes('- old'));
    assert.ok(diff.includes('+ new'));
  });

  it('does not override existing diff or contentSnippet from tool_response', () => {
    const result = sanitize(
      {
        tool_name: 'Edit',
        tool_input: {
          path: 'src/index.ts',
          old_string: 'const x = 1;',
          new_string: 'const x = 2;',
        },
        tool_response: { success: true, diff: '+existing diff', contentSnippet: 'existing snippet' },
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).diff, '+existing diff');
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'existing snippet');
  });

  it('creates contentSnippet when tool_response is a string', () => {
    const result = sanitize(
      {
        tool_name: 'Write',
        tool_input: { path: 'src/index.ts', content: 'export const x = 1;' },
        tool_response: 'File written successfully',
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'File written successfully');
    assert.equal(result.status, 'success');
  });

  it('truncates string tool_response', () => {
    const longResponse = 'a'.repeat(600);
    const result = sanitize(
      {
        tool_name: 'Read',
        tool_input: { path: 'README.md' },
        tool_response: longResponse,
      },
      'post'
    );
    assert.ok(result.output);
    const snippet = (result.output as Record<string, unknown>).contentSnippet as string;
    assert.ok(snippet.endsWith('…'));
    assert.ok(snippet.length <= 481);
  });

  it('extracts contentSnippet from tool_response.result string', () => {
    const result = sanitize(
      {
        tool_name: 'Read',
        tool_input: { path: 'README.md' },
        tool_response: { success: true, result: 'file content here' },
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'file content here');
  });

  it('extracts contentSnippet from tool_response.result array', () => {
    const result = sanitize(
      {
        tool_name: 'Read',
        tool_input: { path: 'README.md' },
        tool_response: { success: true, result: ['line 1', 'line 2'] },
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'line 1\nline 2');
  });

  it('extracts contentSnippet from Bash stdout and output', () => {
    const stdoutResult = sanitize(
      {
        tool_name: 'Bash',
        tool_input: { command: 'echo hi' },
        tool_response: { success: true, stdout: 'hi' },
      },
      'post'
    );
    assert.ok(stdoutResult.output);
    assert.equal((stdoutResult.output as Record<string, unknown>).contentSnippet, 'hi');

    const outputResult = sanitize(
      {
        tool_name: 'Bash',
        tool_input: { command: 'echo hi' },
        tool_response: { success: true, output: 'hi\nbye' },
      },
      'post'
    );
    assert.ok(outputResult.output);
    assert.equal((outputResult.output as Record<string, unknown>).contentSnippet, 'hi\nbye');
  });

  it('skips empty contentSnippet values', () => {
    const result = sanitize(
      {
        tool_name: 'Bash',
        tool_input: { command: 'echo hi' },
        tool_response: { success: true, stdout: '   ', output: 'real' },
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'real');
  });

  it('creates diff for Edit using camelCase keys', () => {
    const result = sanitize(
      {
        tool_name: 'Edit',
        tool_input: {
          path: 'src/index.ts',
          oldString: 'const x = 1;',
          newString: 'const x = 2;',
        },
        tool_response: { success: true },
      },
      'post'
    );
    assert.ok(result.output);
    const diff = (result.output as Record<string, unknown>).diff as string;
    assert.ok(diff.includes('- const x = 1;'));
    assert.ok(diff.includes('+ const x = 2;'));
  });

  it('creates contentSnippet for Write using text fallback', () => {
    const result = sanitize(
      {
        tool_name: 'Write',
        tool_input: { path: 'src/index.ts', text: 'export const x = 1;' },
        tool_response: { success: true },
      },
      'post'
    );
    assert.ok(result.output);
    assert.equal((result.output as Record<string, unknown>).contentSnippet, 'export const x = 1;');
  });
});
