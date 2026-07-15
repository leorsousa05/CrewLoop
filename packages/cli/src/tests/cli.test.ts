import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseArgs, printHelp, run } from '../cli';

async function runSilently(argv: string[]): Promise<number> {
  const original = console.error;
  console.error = () => {};
  try {
    return await run(argv);
  } finally {
    console.error = original;
  }
}

describe('cli', () => {
  it('re-exports the parser for compatibility', () => {
    const args = parseArgs(['node', 'crewloop', 'install']);
    assert.strictEqual(args.command, 'install');
  });

  it('re-exports help for compatibility', () => {
    const help = printHelp();
    assert.ok(help.includes('install'));
    assert.ok(help.includes('list'));
    assert.ok(help.includes('agents'));
    assert.ok(help.includes('doctor'));
    assert.ok(help.includes('dashboard'));
    assert.ok(help.includes('version'));
    assert.ok(!help.includes('validate'));
  });

  it('returns 1 for unknown commands', async () => {
    assert.strictEqual(await runSilently(['nope']), 1);
  });

  it('returns 2 for usage errors', async () => {
    assert.strictEqual(await runSilently(['install', '--wat']), 2);
    assert.strictEqual(await runSilently(['dashboard', '--port', 'abc']), 2);
    assert.strictEqual(await runSilently(['list', 'extra']), 2);
  });
});
