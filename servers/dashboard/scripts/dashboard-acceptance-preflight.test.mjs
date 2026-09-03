import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(new URL('./dashboard-acceptance-preflight.mjs', import.meta.url));
const packageRoot = path.dirname(scriptPath);

function runPreflight(...args) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  });
  assert.equal(result.error, undefined, result.error?.message);
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

test('documents the interaction smoke flag in help output', () => {
  const result = runPreflight('--help');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /--interaction-smoke/);
  assert.equal(result.stderr, '');
});

test('rejects unknown options before connecting to Chrome', () => {
  const result = runPreflight('--unknown');

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /Unknown option: --unknown/);
});

test('rejects a timeout below the minimum before connecting to Chrome', () => {
  const result = runPreflight('--timeout', '99');

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /--timeout must be an integer of at least 100 milliseconds/);
});
