import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractCodexPatchMetadata } from './codex-tool-metadata';

describe('extractCodexPatchMetadata', () => {
  it('extracts bounded snippets for every supported file action', () => {
    const result = extractCodexPatchMetadata({
      command: [
        '*** Begin Patch',
        '*** Add File: src/added.ts',
        '+export const added = true;',
        '*** Update File: src/updated.ts',
        '@@',
        '-const value = 1;',
        '+const value = 2;',
        '*** Delete File: src/deleted.ts',
        '-export const removed = true;',
        '*** Move to: src/moved.ts',
        '@@',
        '+export const moved = true;',
        '*** End Patch',
      ].join('\n'),
    });

    assert.deepEqual(result, {
      operations: [
        {
          path: 'src/added.ts',
          diff: '*** Add File: src/added.ts\n+export const added = true;',
        },
        {
          path: 'src/updated.ts',
          diff: [
            '*** Update File: src/updated.ts',
            '@@',
            '-const value = 1;',
            '+const value = 2;',
          ].join('\n'),
        },
        {
          path: 'src/deleted.ts',
          diff: [
            '*** Delete File: src/deleted.ts',
            '-export const removed = true;',
          ].join('\n'),
        },
        {
          path: 'src/moved.ts',
          diff: [
            '*** Move to: src/moved.ts',
            '@@',
            '+export const moved = true;',
          ].join('\n'),
        },
      ],
    });
    assert.equal(JSON.stringify(result).includes('*** Begin Patch'), false);
    assert.equal(JSON.stringify(result).includes('*** End Patch'), false);
  });

  it('isolates each file segment in a multi-file patch', () => {
    const result = extractCodexPatchMetadata({
      command: [
        '*** Begin Patch',
        '*** Update File: src/a.ts',
        '@@',
        '+const onlyA = true;',
        '*** Update File: src/b.ts',
        '@@',
        '+const onlyB = true;',
        '*** End Patch',
      ].join('\n'),
    });

    assert.equal(result?.operations[0].diff?.includes('onlyA'), true);
    assert.equal(result?.operations[0].diff?.includes('onlyB'), false);
    assert.equal(result?.operations[1].diff?.includes('onlyB'), true);
    assert.equal(result?.operations[1].diff?.includes('onlyA'), false);
  });

  it('normalizes CRLF, merges duplicate paths, and removes unsupported directives', () => {
    const result = extractCodexPatchMetadata({
      command: [
        '*** Begin Patch',
        '*** Update File: src/a.ts',
        '@@',
        '+first',
        '*** Unsupported Directive',
        '*** Delete File: src/a.ts',
        '-second',
        '*** End Patch',
      ].join('\r\n'),
    });

    assert.deepEqual(result, {
      operations: [
        {
          path: 'src/a.ts',
          diff: [
            '*** Update File: src/a.ts',
            '@@',
            '+first',
            '*** Delete File: src/a.ts',
            '-second',
          ].join('\n'),
        },
      ],
    });
    assert.equal(result?.operations[0].diff?.includes('\r'), false);
    assert.equal(result?.operations[0].diff?.includes('Unsupported'), false);
  });

  it('keeps sensitive paths but suppresses their diff bodies', () => {
    const sensitivePaths = [
      '.env',
      'config/.env.production',
      'certs/server.pem',
      'certs/server.key',
      'keys/id_rsa',
      'keys/id_ed25519',
    ];
    const command = ['*** Begin Patch'];
    for (const path of sensitivePaths) {
      command.push(`*** Update File: ${path}`, '+SHOULD_NOT_SURVIVE=true');
    }
    command.push('*** End Patch');

    const result = extractCodexPatchMetadata({ command: command.join('\n') });

    assert.deepEqual(
      result?.operations,
      sensitivePaths.map((path) => ({ path }))
    );
    assert.equal(JSON.stringify(result).includes('SHOULD_NOT_SURVIVE'), false);
  });

  it('redacts every configured sensitive-name family before storage', () => {
    const names = [
      'api_key',
      'api-key',
      'apikey',
      'secret',
      'token',
      'password',
      'passwd',
      'authorization',
      'private_key',
      'private-key',
      'client_secret',
      'client-secret',
    ];
    const result = extractCodexPatchMetadata({
      command: [
        '*** Update File: src/config.ts',
        ...names.map((name, index) => `+${name} = "raw-${index}"`),
      ].join('\n'),
    });
    const diff = result?.operations[0].diff || '';

    assert.equal((diff.match(/\+\[redacted sensitive line\]/g) || []).length, names.length);
    assert.equal(diff.includes('raw-'), false);
  });

  it('redacts common OpenAI, GitHub, AWS, PEM, and Bearer credentials', () => {
    const rawValues = [
      'sk-proj-abcdefghijklmnopqrstuvwxyz',
      'ghp_abcdefghijklmnopqrstuvwxyz123456',
      'github_pat_abcdefghijklmnopqrstuvwxyz',
      'AKIAIOSFODNN7EXAMPLE',
      '-----BEGIN PRIVATE KEY-----',
      'Bearer abc.def.ghi',
    ];
    const result = extractCodexPatchMetadata({
      command: [
        '*** Update File: src/credentials.ts',
        ...rawValues.map((value) => `+value = "${value}"`),
      ].join('\n'),
    });
    const diff = result?.operations[0].diff || '';

    assert.equal((diff.match(/\+\[redacted sensitive line\]/g) || []).length, rawValues.length);
    for (const value of rawValues) {
      assert.equal(diff.includes(value), false);
    }
  });

  it('enforces the per-file limit including the stable truncation marker', () => {
    const maxDiffLength = 80;
    const result = extractCodexPatchMetadata(
      {
        command: [
          '*** Update File: src/long.ts',
          '+first line',
          `+${'x'.repeat(200)}`,
        ].join('\n'),
      },
      { maxDiffLength }
    );
    const diff = result?.operations[0].diff || '';

    assert.ok(diff.length <= maxDiffLength);
    assert.ok(diff.endsWith('…[truncated]'));
    assert.equal(diff.includes('x'.repeat(20)), false);
  });

  it('enforces the aggregate budget and preserves later paths', () => {
    const maxTotalDiffLength = 80;
    const result = extractCodexPatchMetadata(
      {
        command: [
          '*** Update File: src/a.ts',
          `+${'a'.repeat(150)}`,
          '*** Update File: src/b.ts',
          '+const b = true;',
        ].join('\n'),
      },
      { maxDiffLength: 200, maxTotalDiffLength }
    );

    assert.deepEqual(result?.operations.map(({ path }) => path), ['src/a.ts', 'src/b.ts']);
    assert.ok((result?.operations[0].diff?.length || 0) <= maxTotalDiffLength);
    assert.ok(result?.operations[0].diff?.endsWith('…[truncated]'));
    assert.equal(result?.operations[1].diff, undefined);
  });

  it('preserves safe path-only metadata for empty or unsupported bodies', () => {
    const result = extractCodexPatchMetadata({
      command: [
        '*** Update File: src/a.ts',
        '*** Unsupported Directive',
        '*** End Patch',
      ].join('\n'),
    });

    assert.deepEqual(result, {
      operations: [{ path: 'src/a.ts', diff: '*** Update File: src/a.ts' }],
    });
  });

  it('returns undefined for missing, malformed, or unsupported commands', () => {
    assert.equal(extractCodexPatchMetadata(undefined), undefined);
    assert.equal(extractCodexPatchMetadata({}), undefined);
    assert.equal(extractCodexPatchMetadata({ command: 42 }), undefined);
    assert.equal(
      extractCodexPatchMetadata({ command: '*** Rename File: src/a.ts' }),
      undefined
    );
  });

  it('rejects oversized commands, paths, control characters, and path counts', () => {
    assert.equal(
      extractCodexPatchMetadata(
        { command: '*** Update File: src/a.ts\n' },
        { maxCommandLength: 10 }
      ),
      undefined
    );
    assert.equal(
      extractCodexPatchMetadata(
        { command: '*** Update File: src/too-long.ts\n' },
        { maxPathLength: 5 }
      ),
      undefined
    );
    assert.equal(
      extractCodexPatchMetadata({ command: '*** Update File: src/\u0000bad.ts\n' }),
      undefined
    );
    assert.equal(
      extractCodexPatchMetadata(
        {
          command: [
            '*** Add File: src/a.ts',
            '*** Add File: src/b.ts',
          ].join('\n'),
        },
        { maxPathCount: 1 }
      ),
      undefined
    );
  });
});
