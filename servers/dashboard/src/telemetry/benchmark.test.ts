import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareTokenBenchmarks,
  deduplicateTokenBenchmarkRuns,
  formatBenchmarkMarkdown,
  median,
  validateTokenOptimizationCorpus,
  validateTokenBenchmarkDataset,
  type TokenBenchmarkDataset,
  type TokenBenchmarkRun,
} from './benchmark';
import { TOKEN_OPTIMIZATION_SCENARIO_IDS } from './execution';

function run(
  variant: 'baseline' | 'candidate',
  overrides: Partial<TokenBenchmarkRun> = {}
): TokenBenchmarkRun {
  return {
    schemaVersion: 1,
    scenarioId: 'small-change',
    variant,
    repetition: 1,
    source: 'codex',
    model: 'gpt-test',
    passed: true,
    durationMs: variant === 'baseline' ? 1000 : 1050,
    toolCalls: 4,
    modelCalls: variant === 'baseline' ? 2 : 1,
    turns: variant === 'baseline' ? 3 : 2,
    attempts: 1,
    failures: 0,
    verification: 'passed',
    outcome: 'completed',
    stopReason: 'completed',
    costMicrousd: variant === 'baseline' ? 100 : 75,
    tokenUsage: {
      inputTokens: variant === 'baseline' ? 800 : 600,
      outputTokens: variant === 'baseline' ? 200 : 150,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
      totalTokens: variant === 'baseline' ? 1000 : 750,
      quality: 'measured',
      model: 'gpt-test',
      measurementCount: 1,
      rejectedMeasurementCount: 0,
    },
    ...overrides,
  };
}

function dataset(label: string, runs: TokenBenchmarkRun[]): TokenBenchmarkDataset {
  return { schemaVersion: 1, label, runs };
}

describe('token benchmark', () => {
  it('calculates medians for odd and even sets', () => {
    assert.equal(median([3, 1, 2]), 2);
    assert.equal(median([4, 1, 3, 2]), 2.5);
  });

  it('passes a quality-preserving reduction above the threshold', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [run('candidate')])
    );
    assert.equal(result.passed, true);
    assert.equal(result.totalTokens.deltaPercent, -25);
  });

  it('fails when token reduction is below the threshold', () => {
    const candidate = run('candidate');
    candidate.tokenUsage = { ...candidate.tokenUsage, totalTokens: 900 };
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [candidate])
    );
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /below 15%/);
  });

  it('fails when candidate quality regresses', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [run('candidate', { passed: false })])
    );
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /pass every run/);
  });

  it('fails on insufficient measured coverage', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline'), run('baseline', { repetition: 2 })]),
      dataset('after', [
        run('candidate'),
        run('candidate', {
          repetition: 2,
          tokenUsage: {
            ...run('candidate').tokenUsage,
            quality: 'unavailable',
            totalTokens: 0,
            inputTokens: 0,
            outputTokens: 0,
          },
        }),
      ])
    );
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /measured coverage/);
  });

  it('fails on excessive duration regression', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [run('candidate', { durationMs: 1200 })])
    );
    assert.equal(result.passed, false);
    assert.match(result.failures.join('\n'), /duration regression/);
  });

  it('rejects mismatched scenario sets', () => {
    assert.throws(
      () => compareTokenBenchmarks(
        dataset('before', [run('baseline')]),
        dataset('after', [run('candidate', { scenarioId: 'different' })])
      ),
      /scenario sets/
    );
  });

  it('rejects a dataset with the wrong run variant', () => {
    assert.throws(
      () => compareTokenBenchmarks(
        dataset('before', [run('candidate')]),
        dataset('after', [run('candidate')])
      ),
      /baseline runs/
    );
  });

  it('formats a stable markdown report', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [run('candidate')])
    );
    const markdown = formatBenchmarkMarkdown(result);
    assert.match(markdown, /Token Benchmark: PASS/);
    assert.match(markdown, /Total tokens/);
    assert.match(markdown, /Model calls/);
    assert.match(markdown, /Cost per completed task/);
  });

  it('compares execution metrics and cost per completed task', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [run('candidate')])
    );

    assert.equal(result.execution.modelCalls.baselineMedian, 2);
    assert.equal(result.execution.modelCalls.candidateMedian, 1);
    assert.equal(result.execution.turns.deltaPercent, -33.33333333333333);
    assert.equal(result.execution.costPerCompletedTaskMicrousd.baselineMedian, 100);
    assert.equal(result.execution.costPerCompletedTaskMicrousd.candidateMedian, 75);
  });

  it('validates the fixed six-scenario optimization corpus', () => {
    const baselineRuns = TOKEN_OPTIMIZATION_SCENARIO_IDS.map((scenarioId) => run('baseline', { scenarioId }));
    const candidateRuns = TOKEN_OPTIMIZATION_SCENARIO_IDS.map((scenarioId) => run('candidate', { scenarioId }));

    assert.doesNotThrow(() => validateTokenOptimizationCorpus(
      dataset('baseline', baselineRuns),
      dataset('candidate', candidateRuns)
    ));
    assert.throws(() => validateTokenOptimizationCorpus(
      dataset('baseline', baselineRuns.slice(0, -1)),
      dataset('candidate', candidateRuns)
    ), /all token optimization scenarios/);
  });

  it('accepts identical replayed records once and rejects conflicting duplicates', () => {
    const deduped = validateTokenBenchmarkDataset(
      dataset('duplicate', [run('baseline'), run('baseline')])
    );
    assert.equal(deduped.runs.length, 1);
    assert.throws(() => validateTokenBenchmarkDataset(
      dataset('conflict', [run('baseline'), run('baseline', { durationMs: 2_000 })])
    ), /conflicting duplicate identity/);
  });

  it('deduplicates replayed run records before aggregation', () => {
    assert.equal(deduplicateTokenBenchmarkRuns([run('baseline'), run('baseline')]).length, 1);
  });
});
