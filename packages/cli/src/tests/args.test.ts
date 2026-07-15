import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseArgs,
  parsePort,
  isCommandName,
  CliUsageError,
  CliUnknownCommandError,
} from '../args';

describe('args parser', () => {
  it('parses every public command', () => {
    for (const command of ['install', 'list', 'agents', 'doctor', 'dashboard', 'version', 'help']) {
      const args = parseArgs(['node', 'crewloop', command]);
      assert.strictEqual(args.command, command);
    }
  });

  it('returns help when no command is given', () => {
    const args = parseArgs(['node', 'crewloop']);
    assert.strictEqual(args.command, 'help');
  });

  it('parses command help through help <command>', () => {
    const args = parseArgs(['node', 'crewloop', 'help', 'install']);
    assert.strictEqual(args.command, 'help');
    assert.strictEqual(args.helpTopic, 'install');
  });

  it('parses command help through <command> --help', () => {
    const args = parseArgs(['node', 'crewloop', 'install', '--help']);
    assert.strictEqual(args.command, 'help');
    assert.strictEqual(args.helpTopic, 'install');
  });

  it('preserves global help and version aliases', () => {
    assert.strictEqual(parseArgs(['node', 'crewloop', '--help']).command, 'help');
    assert.strictEqual(parseArgs(['node', 'crewloop', '-h']).command, 'help');
    assert.strictEqual(parseArgs(['node', 'crewloop', '--version']).command, 'version');
    assert.strictEqual(parseArgs(['node', 'crewloop', '-v']).command, 'version');
  });

  it('throws CliUnknownCommandError for unknown commands', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'nope']),
      (error: unknown) => {
        assert.ok(error instanceof CliUnknownCommandError);
        assert.strictEqual((error as CliUnknownCommandError).invalidCommand, 'nope');
        assert.strictEqual((error as CliUnknownCommandError).exitCode, 1);
        return true;
      }
    );
  });

  it('throws CliUnknownCommandError for unknown help topics', () => {
    assert.throws(() => parseArgs(['node', 'crewloop', 'help', 'nope']), CliUnknownCommandError);
  });

  it('rejects unknown flags per command', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', '--wat']),
      (error: unknown) => {
        assert.ok(error instanceof CliUsageError);
        assert.match((error as Error).message, /unknown flag "--wat"/);
        return true;
      }
    );
    assert.throws(() => parseArgs(['node', 'crewloop', 'list', '--force']), CliUsageError);
    assert.throws(() => parseArgs(['node', 'crewloop', 'dashboard', '--force']), CliUsageError);
    assert.throws(() => parseArgs(['node', 'crewloop', '--wat']), CliUsageError);
  });

  it('rejects unexpected positional arguments', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', 'extra']),
      /unexpected argument "extra"/
    );
    assert.throws(() => parseArgs(['node', 'crewloop', 'list', 'extra']), CliUsageError);
  });

  it('rejects missing flag values', () => {
    for (const flag of ['--target', '--skill', '--agent']) {
      assert.throws(() => parseArgs(['node', 'crewloop', 'install', flag]), new RegExp(`${flag} requires a value`));
    }
    for (const flag of ['--port', '--host']) {
      assert.throws(() => parseArgs(['node', 'crewloop', 'dashboard', flag]), new RegExp(`${flag} requires a value`));
    }
  });

  it('rejects flag values that look like flags', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', '--target', '--force']),
      /--target requires a value/
    );
  });

  it('rejects install-only flags on unrelated commands', () => {
    assert.throws(() => parseArgs(['node', 'crewloop', 'dashboard', '--target', '/tmp']), CliUsageError);
    assert.throws(() => parseArgs(['node', 'crewloop', 'agents', '--verbose']), CliUsageError);
    assert.throws(() => parseArgs(['node', 'crewloop', 'doctor', '--dry-run']), CliUsageError);
  });

  it('rejects invalid ports', () => {
    for (const value of ['abc', '8080abc', '0', '65536', '-1']) {
      assert.throws(
        () => parseArgs(['node', 'crewloop', 'dashboard', '--port', value]),
        new RegExp(`invalid --port "${value}"`)
      );
    }
  });

  it('accepts valid port boundaries', () => {
    assert.strictEqual(parsePort('1'), 1);
    assert.strictEqual(parsePort('7890'), 7890);
    assert.strictEqual(parsePort('65535'), 65535);
  });

  it('parses install flags including --verbose', () => {
    const args = parseArgs([
      'node', 'crewloop', 'install',
      '--target', '/tmp/skills',
      '--skill', 'architect', '--skill', 'engineer',
      '--agent', 'claude',
      '--symlink', '--force', '--dry-run', '--verbose',
    ]);
    assert.strictEqual(args.target, '/tmp/skills');
    assert.deepStrictEqual(args.skills, ['architect', 'engineer']);
    assert.strictEqual(args.agent, 'claude');
    assert.strictEqual(args.symlink, true);
    assert.strictEqual(args.force, true);
    assert.strictEqual(args.dryRun, true);
    assert.strictEqual(args.verbose, true);
  });

  it('parses --hooks and --no-hooks', () => {
    assert.strictEqual(parseArgs(['node', 'crewloop', 'install', '--hooks']).hooks, true);
    assert.strictEqual(parseArgs(['node', 'crewloop', 'install', '--no-hooks']).hooks, false);
  });

  it('parses --diamondblock only for install', () => {
    const args = parseArgs(['node', 'crewloop', 'install', '--diamondblock']);
    assert.strictEqual(args.diamondblock, true);
    assert.throws(() => parseArgs(['node', 'crewloop', 'doctor', '--diamondblock']), CliUsageError);
    assert.throws(() => parseArgs(['node', 'crewloop', 'list', '--diamondblock']), CliUsageError);
    assert.throws(() => parseArgs(['node', 'crewloop', 'dashboard', '--diamondblock']), CliUsageError);
  });

  it('combines --diamondblock with --agent and --dry-run', () => {
    const args = parseArgs([
      'node', 'crewloop', 'install',
      '--agent', 'claude', '--dry-run', '--diamondblock',
    ]);
    assert.strictEqual(args.diamondblock, true);
    assert.strictEqual(args.agent, 'claude');
    assert.strictEqual(args.dryRun, true);
  });

  it('validates remaining arguments after --help or --version', () => {
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'list', '--help', '--unknown']),
      CliUsageError
    );
    assert.throws(
      () => parseArgs(['node', 'crewloop', 'install', '--version', '--wat']),
      CliUsageError
    );
    const help = parseArgs(['node', 'crewloop', 'install', '--force', '--help']);
    assert.strictEqual(help.command, 'help');
    assert.strictEqual(help.helpTopic, 'install');
    assert.strictEqual(help.force, true);
  });

  it('identifies command names', () => {
    assert.ok(isCommandName('install'));
    assert.ok(isCommandName('doctor'));
    assert.ok(!isCommandName('validate'));
  });
});
