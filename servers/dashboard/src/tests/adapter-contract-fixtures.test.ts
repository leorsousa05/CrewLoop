import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { buildEvent } from '../adapters/shim';
import type { AgentSource } from '../types';

interface AdapterFixture {
  success: Record<string, unknown>;
  failure: Record<string, unknown>;
}

const fixtures: Array<{ source: Exclude<AgentSource, 'log-watcher'>; file: string }> = [
  { source: 'kimi', file: 'kimi.json' },
  { source: 'claude', file: 'claude.json' },
  { source: 'codex', file: 'codex.json' },
  { source: 'agy', file: 'agy.json' },
  { source: 'opencode', file: 'opencode.json' },
];

function readFixture(file: string): AdapterFixture {
  const fixturePath = path.resolve(__dirname, '../../test/fixtures', file);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as AdapterFixture;
}

describe('adapter contract fixtures', () => {
  for (const { source, file } of fixtures) {
    it(`${source} preserves identity, path, failure, duration, and optional-field behavior`, () => {
      const fixture = readFixture(file);
      const success = buildEvent(source, fixture.success);
      const failure = buildEvent(source, fixture.failure);

      assert.ok(success, `${source} success fixture should normalize`);
      assert.ok(failure, `${source} failure fixture should normalize`);
      assert.equal(success!.source, source);
      assert.equal(failure!.source, source);
      assert.equal(success!.event_type, 'tool_start');
      assert.equal(failure!.event_type, 'tool_end');
      assert.ok(success!.session_id);
      assert.ok(success!.workspacePath);
      assert.ok(success!.invocation_id);
      assert.ok(failure!.invocation_id);
      assert.equal(failure!.status, 'error');
      assert.equal(typeof failure!.duration_ms, 'number');
      assert.equal(fixture.success.model, undefined);
    });
  }
});
