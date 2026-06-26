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

  it('parses dashboard command', () => {
    const args = parseArgs(['node', 'crewloop', 'dashboard']);
    assert.strictEqual(args.command, 'dashboard');
  });

  it('parses doctor command', () => {
    const args = parseArgs(['node', 'crewloop', 'doctor']);
    assert.strictEqual(args.command, 'doctor');
  });

  it('parses --version flag', () => {
    const args = parseArgs(['node', 'crewloop', '--version']);
    assert.strictEqual(args.command, 'version');
  });

  it('parses -v flag', () => {
    const args = parseArgs(['node', 'crewloop', '-v']);
    assert.strictEqual(args.command, 'version');
  });

  it('parses dashboard flags', () => {
    const args = parseArgs([
      'node',
      'crewloop',
      'dashboard',
      '--port',
      '8080',
      '--host',
      '0.0.0.0',
    ]);
    assert.strictEqual(args.command, 'dashboard');
    assert.strictEqual(args.port, 8080);
    assert.strictEqual(args.host, '0.0.0.0');
  });

  it('throws when dashboard --port has no value', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'dashboard', '--port']),
      /--port requires a value/
    );
  });

  it('throws when dashboard --host has no value', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'dashboard', '--host']),
      /--host requires a value/
    );
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
    assert.ok(help.includes('dashboard'));
    assert.ok(help.includes('doctor'));
    assert.ok(help.includes('--target'));
    assert.ok(help.includes('--port'));
    assert.ok(help.includes('--version'));
    assert.ok(help.includes('version'));
  });

  it('help text documents hooks section', () => {
    const help = printHelp();
    assert.ok(help.includes('Hooks:'));
    assert.ok(help.includes('Supported agents:'));
    assert.ok(help.includes('kimi'));
    assert.ok(help.includes('claude'));
    assert.ok(help.includes('codex'));
    assert.ok(help.includes('agy'));
    assert.ok(help.includes('kimi/codex/agy'));
    assert.ok(help.includes('before_tool_use/after_tool_use for claude'));
    assert.ok(help.includes('--no-hooks'));
  });

  it('help text includes usage examples', () => {
    const help = printHelp();
    assert.ok(help.includes('Examples:'));
    assert.ok(help.includes('crewloop install'));
    assert.ok(help.includes('crewloop install --skill architect --skill engineer'));
    assert.ok(help.includes('crewloop install --agent claude --no-hooks'));
    assert.ok(help.includes('crewloop install --dry-run'));
    assert.ok(help.includes('crewloop list'));
    assert.ok(help.includes('crewloop dashboard --port 8080'));
    assert.ok(help.includes('crewloop doctor'));
    assert.ok(help.includes('crewloop --version'));
  });

  it('help text documents known commands only', () => {
    const help = printHelp();
    assert.ok(!help.includes('validate'));
  });
});
