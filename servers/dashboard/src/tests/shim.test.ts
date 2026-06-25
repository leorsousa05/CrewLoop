import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { runShim } from '../adapters/shim';

function runBin(args: string[], input?: string): Promise<{ exitCode: number | null; stderr: string }> {
  const binPath = path.join(__dirname, '..', '..', 'bin', 'crewloop-shim.js');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [binPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr!.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (exitCode) => {
      resolve({ exitCode, stderr });
    });
    if (input !== undefined) {
      child.stdin!.write(input);
    }
    child.stdin!.end();
  });
}

describe('shim binary', () => {
  it('exports runShim from adapters/shim', () => {
    assert.strictEqual(typeof runShim, 'function');
  });

  it('exits 0 for a supported source with empty stdin', async () => {
    const { exitCode, stderr } = await runBin(['kimi']);
    assert.strictEqual(exitCode, 0);
    assert.strictEqual(stderr, '');
  });

  it('exits 1 and prints usage for an unsupported source', async () => {
    const { exitCode, stderr } = await runBin(['unknown']);
    assert.strictEqual(exitCode, 1);
    assert.ok(stderr.includes('unknown source'));
    assert.ok(stderr.includes('crewloop-shim <kimi|codex|agy|opencode|log-watcher>'));
  });
});
