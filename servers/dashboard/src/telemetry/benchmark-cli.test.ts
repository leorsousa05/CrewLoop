import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runBenchmarkCli } from './benchmark-cli';

function fixture(name: string): string {
  return path.resolve(__dirname, '../../src/telemetry/fixtures', name);
}

const SCENARIOS = [
  'docs-small',
  'cli-small',
  'dashboard-logic',
  'dashboard-ui',
  'security-boundary',
  'verification-failure',
] as const;

interface ExecutionDatasetFixture {
  label: string;
  policy: { id: string; version: string };
  source: string;
  records: Array<Record<string, unknown>>;
}

function executionDataset(variant: 'baseline' | 'candidate'): ExecutionDatasetFixture {
  const candidate = variant === 'candidate';
  return {
    label: `execution-${variant}`,
    policy: {
      id: 'token-optimizer',
      version: candidate ? 'candidate-v1' : 'baseline-v1',
    },
    source: 'codex',
    records: SCENARIOS.map((scenarioId, index) => ({
      schemaVersion: 1,
      taskId: `${variant}-task-${index + 1}`,
      scenarioId,
      variant,
      repetition: 1,
      risk: 'low',
      profile: 'balanced',
      startedAt: 1_000,
      endedAt: candidate ? 2_050 : 2_000,
      durationMs: candidate ? 1_050 : 1_000,
      modelCalls: 2,
      toolCalls: 4,
      turns: 3,
      attempts: 1,
      failures: 0,
      verification: 'passed',
      outcome: 'completed',
      stopReason: 'completed',
      tokenUsage: {
        inputTokens: candidate ? 600 : 800,
        outputTokens: candidate ? 150 : 200,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        reasoningTokens: 0,
        totalTokens: candidate ? 750 : 1_000,
        quality: 'measured',
        model: 'fixture-model',
        measurementCount: 1,
        rejectedMeasurementCount: 0,
      },
      costMicrousd: candidate ? 75 : 100,
    })) as Array<Record<string, unknown>>,
  };
}

function writeJsonInput(root: string, name: string, value: unknown): string {
  const file = path.join(root, name);
  fs.writeFileSync(file, JSON.stringify(value), 'utf8');
  return file;
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

  it('compares paired execution-record files through the existing benchmark gate', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-benchmark-records-'));
    try {
      let stdout = '';
      let stderr = '';
      const exitCode = runBenchmarkCli([
        '--baseline-records', writeJsonInput(root, 'baseline.json', executionDataset('baseline')),
        '--candidate-records', writeJsonInput(root, 'candidate.json', executionDataset('candidate')),
        '--format', 'json',
      ], {
        stdout: (value) => { stdout += value; },
        stderr: (value) => { stderr += value; },
      });

      assert.equal(exitCode, 0);
      assert.equal(stderr, '');
      const report = JSON.parse(stdout) as {
        decision: string;
        totalTokens: { deltaPercent: number | null };
        measuredCoveragePercent: number;
      };
      assert.equal(report.decision, 'adopt_candidate');
      assert.equal(report.totalTokens.deltaPercent, -25);
      assert.equal(report.measuredCoveragePercent, 100);

      stdout = '';
      stderr = '';
      const markdownExitCode = runBenchmarkCli([
        '--baseline-records', path.join(root, 'baseline.json'),
        '--candidate-records', path.join(root, 'candidate.json'),
        '--format', 'markdown',
      ], {
        stdout: (value) => { stdout += value; },
        stderr: (value) => { stderr += value; },
      });
      assert.equal(markdownExitCode, 0);
      assert.equal(stderr, '');
      assert.match(stdout, /^# Token Benchmark: PASS/);
      assert.match(stdout, /- Decision: adopt_candidate/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('fails closed when an execution-record file has unavailable measurements', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-benchmark-incomplete-'));
    try {
      const incomplete = executionDataset('baseline');
      incomplete.records[2].tokenUsage = null;
      let stdout = '';
      let stderr = '';
      const exitCode = runBenchmarkCli([
        '--baseline-records', writeJsonInput(root, 'baseline.json', incomplete),
        '--candidate-records', writeJsonInput(root, 'candidate.json', executionDataset('candidate')),
        '--format', 'json',
      ], {
        stdout: (value) => { stdout += value; },
        stderr: (value) => { stderr += value; },
      });

      assert.equal(exitCode, 2);
      assert.equal(stdout, '');
      assert.equal(stderr, 'token benchmark: execution benchmark input unavailable: 2:token_usage_unavailable\n');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects incomplete or mixed CLI input modes with usage errors', () => {
    let stdout = '';
    let stderr = '';
    const missingPairExitCode = runBenchmarkCli([
      '--baseline-records', fixture('baseline.json'),
    ], {
      stdout: (value) => { stdout += value; },
      stderr: (value) => { stderr += value; },
    });
    assert.equal(missingPairExitCode, 2);
    assert.equal(stdout, '');
    assert.match(stderr, /usage: --baseline-records <file> --candidate-records <file>/);

    stdout = '';
    stderr = '';
    const missingValueExitCode = runBenchmarkCli([
      '--baseline-records',
      '--candidate-records', fixture('candidate.json'),
    ], {
      stdout: (value) => { stdout += value; },
      stderr: (value) => { stderr += value; },
    });
    assert.equal(missingValueExitCode, 2);
    assert.equal(stdout, '');
    assert.match(stderr, /usage: --baseline-records <file> --candidate-records <file>/);

    stdout = '';
    stderr = '';
    const mixedExitCode = runBenchmarkCli([
      '--baseline', fixture('baseline.json'),
      '--candidate', fixture('candidate.json'),
      '--baseline-records', fixture('baseline.json'),
      '--candidate-records', fixture('candidate.json'),
    ], {
      stdout: (value) => { stdout += value; },
      stderr: (value) => { stderr += value; },
    });
    assert.equal(mixedExitCode, 2);
    assert.equal(stdout, '');
    assert.match(stderr, /usage: --baseline <file> --candidate <file> \| --baseline-records/);
  });

  it('rejects malformed execution-record containers without parsing a partial dataset', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crewloop-benchmark-malformed-'));
    try {
      let stdout = '';
      let stderr = '';
      const exitCode = runBenchmarkCli([
        '--baseline-records', writeJsonInput(root, 'baseline.json', { records: [] }),
        '--candidate-records', writeJsonInput(root, 'candidate.json', executionDataset('candidate')),
      ], {
        stdout: (value) => { stdout += value; },
        stderr: (value) => { stderr += value; },
      });

      assert.equal(exitCode, 2);
      assert.equal(stdout, '');
      assert.equal(stderr, 'token benchmark: execution benchmark input must contain label, policy, source, and records\n');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
