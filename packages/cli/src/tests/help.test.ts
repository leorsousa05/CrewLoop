import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getHelpTopic, listHelpTopics, printCommandHelp, printHelp } from '../help';

const COMMANDS = ['install', 'list', 'agents', 'doctor', 'dashboard', 'version', 'help'] as const;

describe('help', () => {
  it('top-level help lists all seven commands', () => {
    const help = printHelp();
    for (const command of COMMANDS) {
      assert.ok(help.includes(command), `help should include ${command}`);
    }
  });

  it('top-level help keeps Hooks and Examples sections', () => {
    const help = printHelp();
    assert.ok(help.includes('Hooks:'));
    assert.ok(help.includes('Supported agents:'));
    assert.ok(help.includes('kimi'));
    assert.ok(help.includes('claude'));
    assert.ok(help.includes('codex'));
    assert.ok(help.includes('agy'));
    assert.ok(help.includes('opencode'));
    assert.ok(help.includes('--no-hooks'));
    assert.ok(help.includes('Examples:'));
  });

  it('top-level examples include new commands', () => {
    const help = printHelp();
    assert.ok(help.includes('crewloop agents'));
    assert.ok(help.includes('crewloop doctor'));
    assert.ok(help.includes('crewloop install --dry-run'));
    assert.ok(help.includes('crewloop dashboard --port 8080'));
    assert.ok(help.includes('crewloop --version'));
  });

  it('has a help topic for every public command', () => {
    const topics = listHelpTopics();
    assert.strictEqual(topics.length, COMMANDS.length);
    for (const command of COMMANDS) {
      assert.ok(getHelpTopic(command));
      assert.ok(printCommandHelp(command).includes('crewloop'));
    }
  });

  it('install help documents all install options', () => {
    const help = printHelp('install');
    for (const flag of ['--target', '--skill', '--agent', '--symlink', '--force', '--dry-run', '--hooks', '--no-hooks', '--verbose']) {
      assert.ok(help.includes(flag), `install help should include ${flag}`);
    }
  });

  it('dashboard help documents --port and --host', () => {
    const help = printHelp('dashboard');
    assert.ok(help.includes('--port'));
    assert.ok(help.includes('--host'));
  });

  it('does not include unplanned commands', () => {
    const help = printHelp();
    assert.ok(!help.includes('validate'));
  });
});
