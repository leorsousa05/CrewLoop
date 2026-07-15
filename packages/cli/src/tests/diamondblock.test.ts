import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildDiamondBlockInstallArgs,
  createDefaultDiamondBlockExecutor,
  createDiamondBlockCommandRunner,
  formatDiamondBlockInstallResult,
  type DiamondBlockExecution,
} from '../diamondblock';

function execution(partial: Partial<DiamondBlockExecution> = {}): DiamondBlockExecution {
  return { exitCode: 0, stdout: '', stderr: '', ...partial };
}

describe('diamondblock adapter', () => {
  it('builds base install args', () => {
    assert.deepStrictEqual(buildDiamondBlockInstallArgs({ dryRun: false }), ['install']);
  });

  it('adds --target only when an agent is defined', () => {
    assert.deepStrictEqual(
      buildDiamondBlockInstallArgs({ agent: 'claude', dryRun: false }),
      ['install', '--target', 'claude']
    );
    assert.deepStrictEqual(buildDiamondBlockInstallArgs({ dryRun: false }), ['install']);
  });

  it('adds --dry-run and keeps argument order', () => {
    assert.deepStrictEqual(
      buildDiamondBlockInstallArgs({ agent: 'kimi', dryRun: true }),
      ['install', '--target', 'kimi', '--dry-run']
    );
    assert.deepStrictEqual(buildDiamondBlockInstallArgs({ dryRun: true }), ['install', '--dry-run']);
  });

  it('resolves diamondblock before dblock', () => {
    const runner = createDiamondBlockCommandRunner({
      findOnPath: (binary) => `/usr/bin/${binary}`,
      execute: () => execution(),
    });
    assert.strictEqual(runner.findExecutable(), '/usr/bin/diamondblock');
  });

  it('falls back to dblock when diamondblock is missing', () => {
    const runner = createDiamondBlockCommandRunner({
      findOnPath: (binary) => (binary === 'dblock' ? '/usr/bin/dblock' : undefined),
      execute: () => execution(),
    });
    assert.strictEqual(runner.findExecutable(), '/usr/bin/dblock');
  });

  it('returns unavailable without spawning when no executable exists', () => {
    let spawnCalls = 0;
    const runner = createDiamondBlockCommandRunner({
      findOnPath: () => undefined,
      execute: () => {
        spawnCalls++;
        return execution();
      },
    });
    const preflight = runner.preflight({ dryRun: true });
    assert.strictEqual(preflight.status, 'unavailable');
    assert.strictEqual(preflight.exitCode, 1);
    assert.ok(preflight.stderr.includes('npm i -g diamondblock'));
    const install = runner.install({ dryRun: false });
    assert.strictEqual(install.status, 'unavailable');
    assert.strictEqual(install.exitCode, 1);
    assert.strictEqual(spawnCalls, 0);
  });

  it('maps preflight exit 0 to ready and forces dry-run args', () => {
    const calls: Array<{ executable: string; args: readonly string[] }> = [];
    const runner = createDiamondBlockCommandRunner({
      findOnPath: () => '/usr/bin/diamondblock',
      execute: (executable, args) => {
        calls.push({ executable, args });
        return execution();
      },
    });
    const result = runner.preflight({ agent: 'claude', dryRun: false });
    assert.strictEqual(result.status, 'ready');
    assert.strictEqual(result.dryRun, true);
    assert.deepStrictEqual(calls, [
      { executable: '/usr/bin/diamondblock', args: ['install', '--target', 'claude', '--dry-run'] },
    ]);
  });

  it('maps preflight non-zero exit to unsupported with the real code', () => {
    const runner = createDiamondBlockCommandRunner({
      findOnPath: () => '/usr/bin/diamondblock',
      execute: () => execution({ exitCode: 3, stderr: 'unsupported agent' }),
    });
    const result = runner.preflight({ dryRun: true });
    assert.strictEqual(result.status, 'unsupported');
    assert.strictEqual(result.exitCode, 3);
    assert.strictEqual(result.stderr, 'unsupported agent');
  });

  it('maps install exit 0 to configured', () => {
    const runner = createDiamondBlockCommandRunner({
      findOnPath: () => '/usr/bin/diamondblock',
      execute: () => execution({ stdout: 'done' }),
    });
    const result = runner.install({ dryRun: false });
    assert.strictEqual(result.status, 'configured');
    assert.strictEqual(result.exitCode, 0);
    assert.strictEqual(result.executable, '/usr/bin/diamondblock');
  });

  it('maps install non-zero exit to failed', () => {
    const runner = createDiamondBlockCommandRunner({
      findOnPath: () => '/usr/bin/diamondblock',
      execute: () => execution({ exitCode: 2, stderr: 'boom' }),
    });
    const result = runner.install({ dryRun: false });
    assert.strictEqual(result.status, 'failed');
    assert.strictEqual(result.exitCode, 2);
  });

  it('passes executable and args separately without shell interpolation', () => {
    const calls: Array<{ executable: string; args: readonly string[] }> = [];
    const runner = createDiamondBlockCommandRunner({
      findOnPath: () => '/opt/diamond block/bin/diamondblock',
      execute: (executable, args) => {
        calls.push({ executable, args });
        return execution();
      },
    });
    runner.install({ agent: 'weird;rm -rf /', dryRun: true });
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].executable, '/opt/diamond block/bin/diamondblock');
    assert.deepStrictEqual(calls[0].args, ['install', '--target', 'weird;rm -rf /', '--dry-run']);
  });

  it('bounds long stdout and stderr with an ellipsis marker', () => {
    const runner = createDiamondBlockCommandRunner({
      findOnPath: () => '/usr/bin/diamondblock',
      execute: () => execution({ stdout: 'x'.repeat(5000), stderr: 'y'.repeat(5000) }),
    });
    const result = runner.install({ dryRun: false });
    assert.strictEqual(result.stdout.length, 2001);
    assert.ok(result.stdout.endsWith('…'));
    assert.strictEqual(result.stderr.length, 2001);
    assert.ok(result.stderr.endsWith('…'));
  });

  it('default executor kills a hung process after the timeout', () => {
    const execute = createDefaultDiamondBlockExecutor(50);
    const result = execute(process.execPath, ['-e', 'setTimeout(() => {}, 10000)']);
    assert.strictEqual(result.exitCode, 1);
    assert.ok(result.error);
    assert.ok(result.stderr.length > 0);
  });

  it('default executor captures output from a successful process', () => {
    const execute = createDefaultDiamondBlockExecutor(5000);
    const result = execute(process.execPath, ['-e', 'process.stdout.write("ok-output")']);
    assert.strictEqual(result.exitCode, 0);
    assert.strictEqual(result.stdout, 'ok-output');
    assert.strictEqual(result.error, undefined);
  });

  it('formats concise result lines', () => {
    const formatted = formatDiamondBlockInstallResult({
      status: 'configured',
      executable: '/usr/bin/diamondblock',
      dryRun: false,
      exitCode: 0,
      stdout: 'all good',
      stderr: '',
    });
    const lines = formatted.split('\n');
    assert.strictEqual(lines[0], 'diamondblock: configured');
    assert.ok(formatted.includes('all good'));
  });
});
