import { describe, it } from 'node:test';
import assert from 'node:assert';
import os from 'node:os';
import path from 'node:path';
import { CliUsageError } from '../args';
import { displayPath, formatUnknownCommand, formatUsageError, pluralize } from '../output';

describe('output', () => {
  it('formats usage errors with usage line when command is known', () => {
    const lines = formatUsageError(new CliUsageError('unknown flag "--wat"', 'install'));
    assert.strictEqual(lines[0], 'error: unknown flag "--wat"');
    assert.strictEqual(lines[1], 'usage: crewloop install [options]');
  });

  it('formats usage errors with hint when command is unknown', () => {
    const lines = formatUsageError(new CliUsageError('unknown flag "--wat"'));
    assert.strictEqual(lines[0], 'error: unknown flag "--wat"');
    assert.strictEqual(lines[1], 'hint: run "crewloop help"');
  });

  it('formats unknown command errors with hint', () => {
    const lines = formatUnknownCommand('nope');
    assert.deepStrictEqual(lines, [
      'error: unknown command "nope"',
      'hint: run "crewloop help"',
    ]);
  });

  it('pluralizes zero, one, and many', () => {
    assert.strictEqual(pluralize(0, 'skill'), '0 skills');
    assert.strictEqual(pluralize(1, 'skill'), '1 skill');
    assert.strictEqual(pluralize(2, 'skill'), '2 skills');
    assert.strictEqual(pluralize(1, 'error'), '1 error');
    assert.strictEqual(pluralize(3, 'error'), '3 errors');
    assert.strictEqual(pluralize(2, 'existing skill'), '2 existing skills');
  });

  it('collapses home directory to ~', () => {
    const home = os.homedir();
    assert.strictEqual(displayPath(path.join(home, '.claude', 'settings.json')), '~/.claude/settings.json');
    assert.strictEqual(displayPath(home), '~');
    assert.strictEqual(displayPath('/opt/other/path'), '/opt/other/path');
  });
});
