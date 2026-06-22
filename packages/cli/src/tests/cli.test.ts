import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseArgs, printHelp } from '../cli';

describe('cli', () => {
  it('parses install command', () => {
    const args = parseArgs(['node', 'crewloop', 'install']);
    assert.strictEqual(args.command, 'install');
  });

  it('parses list command', () => {
    const args = parseArgs(['node', 'crewloop', 'list']);
    assert.strictEqual(args.command, 'list');
  });

  it('parses all flags', () => {
    const args = parseArgs([
      'node',
      'crewloop',
      'install',
      '--target',
      '/tmp/skills',
      '--skill',
      'architect',
      '--skill',
      'engineer',
      '--agent',
      'claude',
      '--symlink',
      '--force',
      '--dry-run',
    ]);

    assert.strictEqual(args.command, 'install');
    assert.strictEqual(args.target, '/tmp/skills');
    assert.deepStrictEqual(args.skills, ['architect', 'engineer']);
    assert.strictEqual(args.agent, 'claude');
    assert.strictEqual(args.symlink, true);
    assert.strictEqual(args.force, true);
    assert.strictEqual(args.dryRun, true);
  });

  it('throws when --target has no value', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', '--target']),
      /--target requires a value/
    );
  });

  it('throws when --skill has no value', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', '--skill']),
      /--skill requires a value/
    );
  });

  it('throws when --agent has no value', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', '--agent']),
      /--agent requires a value/
    );
  });

  it('throws when flag value looks like another flag', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', '--target', '--force']),
      /--target requires a value/
    );
  });

  it('returns help text', () => {
    const help = printHelp();
    assert.ok(help.includes('install'));
    assert.ok(help.includes('list'));
    assert.ok(help.includes('--target'));
  });
});
