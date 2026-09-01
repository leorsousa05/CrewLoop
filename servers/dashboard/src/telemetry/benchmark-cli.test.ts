import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { runBenchmarkCli } from './benchmark-cli';

function fixture(name: string): string {
  return path.resolve(__dirname, '../../src/telemetry/fixtures', name);
}

describe('token benchmark CLI', () => {
  it('emits a JSON adoption recommendation for a passing fixed corpus', () => {
    let stdout = '';
    let stderr = '';
    const exitCode = runBenchmarkCli([
      '--baseline', fixture('baseline.json'),
      '--candidate', fixture('candidate.json'),
      '--format', 'json',
    ], {
      stdout: (value) => { stdout += value; },
      stderr: (value) => { stderr += value; },
    });

    assert.equal(exitCode, 0);
    assert.equal(stderr, '');
    const report = JSON.parse(stdout) as {
      decision: string;
      policy: { baseline: { version: string }; candidate: { version: string } };
    };
    assert.equal(report.decision, 'adopt_candidate');
    assert.equal(report.policy.baseline.version, 'baseline-v1');
    assert.equal(report.policy.candidate.version, 'candidate-v1');
  });

  it('emits keep_baseline and a failing exit code for a quality regression', () => {
    let stdout = '';
    let stderr = '';
    const exitCode = runBenchmarkCli([
      '--baseline', fixture('baseline.json'),
      '--candidate', fixture('candidate-fail.json'),
      '--format', 'json',
    ], {
      stdout: (value) => { stdout += value; },
      stderr: (value) => { stderr += value; },
    });

    assert.equal(exitCode, 1);
    assert.equal(stderr, '');
    const report = JSON.parse(stdout) as { decision: string; failures: string[] };
    assert.equal(report.decision, 'keep_baseline');
    assert.match(report.failures.join('\n'), /candidate must pass every run/);
  });
});
