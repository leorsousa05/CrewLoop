import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTokenBenchmarkDatasetFromExecutionRecords,
  compareTokenBenchmarks,
  compareTokenOptimizationBenchmarks,
  deduplicateTokenBenchmarkRuns,
  formatBenchmarkMarkdown,
  median,
  projectTaskExecutionRecord,
  validateTokenOptimizationCorpus,
  validateTokenBenchmarkDataset,
  type TokenBenchmarkDataset,
  type TokenBenchmarkRun,
} from './benchmark';
import { TOKEN_OPTIMIZATION_SCENARIO_IDS, type TaskExecutionRecord } from './execution';

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
  return {
    schemaVersion: 1,
    label,
    policy: { id: 'token-optimizer', version: label },
    runs,
  };
}

function executionRecord(overrides: Partial<TaskExecutionRecord> = {}): TaskExecutionRecord {
  return {
    schemaVersion: 1,
    taskId: 'task-1',
    scenarioId: 'cli-small',
    variant: 'candidate',
    repetition: 1,
    risk: 'low',
    profile: 'balanced',
    startedAt: 1_000,
    endedAt: 1_500,
    durationMs: 500,
    modelCalls: 2,
    toolCalls: 3,
    turns: 2,
    attempts: 1,
    failures: 0,
    verification: 'passed',
    outcome: 'completed',
    stopReason: 'completed',
    tokenUsage: {
      inputTokens: 600,
      outputTokens: 150,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
      totalTokens: 750,
      quality: 'measured',
      model: 'gpt-test',
      measurementCount: 1,
      rejectedMeasurementCount: 0,
    },
    costMicrousd: 75,
    ...overrides,
  };
}

describe('token benchmark', () => {
  it('projects a complete execution record without losing benchmark metrics', () => {
    const record = executionRecord();
    const first = projectTaskExecutionRecord(record, 'codex');
    const second = projectTaskExecutionRecord(record, 'codex');

    assert.equal(first.status, 'ready');
    assert.deepEqual(first, second);
    if (first.status !== 'ready') return;
    assert.deepEqual(first.run, {
      schemaVersion: 1,
      scenarioId: 'cli-small',
      variant: 'candidate',
      repetition: 1,
      model: 'gpt-test',
      source: 'codex',
      passed: true,
      durationMs: 500,
      toolCalls: 3,
      risk: 'low',
      profile: 'balanced',
      modelCalls: 2,
      turns: 2,
      attempts: 1,
      failures: 0,
      verification: 'passed',
      outcome: 'completed',
      stopReason: 'completed',
      costMicrousd: 75,
      tokenUsage: record.tokenUsage,
    });
  });

  it('derives benchmark success only from completed passed execution', () => {
    const failed = projectTaskExecutionRecord(
      executionRecord({ verification: 'failed', outcome: 'failed', stopReason: 'validation_failed' }),
      'codex'
    );
    const incomplete = projectTaskExecutionRecord(
      executionRecord({ outcome: 'incomplete', stopReason: 'budget_exhausted' }),
      'codex'
    );

    assert.equal(failed.status, 'ready');
    assert.equal(incomplete.status, 'ready');
    if (failed.status === 'ready') assert.equal(failed.run.passed, false);
    if (incomplete.status === 'ready') assert.equal(incomplete.run.passed, false);
  });

  it('keeps unavailable execution measurements out of benchmark runs', () => {
    const cases: [keyof TaskExecutionRecord, string][] = [
      ['tokenUsage', 'token_usage_unavailable'],
      ['durationMs', 'duration_unavailable'],
      ['toolCalls', 'tool_calls_unavailable'],
    ];

    for (const [field, reason] of cases) {
      const result = projectTaskExecutionRecord(
        executionRecord({ [field]: null } as Partial<TaskExecutionRecord>),
        'codex'
      );
      assert.deepEqual(result, { status: 'unavailable', reason });
    }
  });

  it('rejects invalid records and unknown sources with bounded errors', () => {
    assert.throws(
      () => projectTaskExecutionRecord(executionRecord({ taskId: '../secret' }), 'codex'),
      (error: unknown) => error instanceof Error
        && /taskId is invalid/.test(error.message)
        && !error.message.includes('secret')
    );
    assert.throws(
      () => projectTaskExecutionRecord(executionRecord(), 'unknown' as never),
      /benchmark projection source is invalid/
    );
  });

  it('builds a deterministic benchmark dataset from complete execution records', () => {
    const input = {
      label: 'execution-records',
      policy: { id: 'token-optimizer', version: 'candidate-v1' },
      source: 'codex' as const,
      records: [
        executionRecord({ variant: 'baseline' }),
        executionRecord({ variant: 'candidate' }),
      ],
    };
    const first = buildTokenBenchmarkDatasetFromExecutionRecords(input);
    const second = buildTokenBenchmarkDatasetFromExecutionRecords(input);

    assert.equal(first.status, 'ready');
    assert.deepEqual(first, second);
    if (first.status !== 'ready') return;
    assert.deepEqual(first.dataset.runs.map((benchmarkRun) => benchmarkRun.variant), [
      'baseline',
      'candidate',
    ]);
    assert.equal(first.dataset.runs[0].tokenUsage.totalTokens, 750);
  });

  it('reports every unavailable required measurement without producing a dataset', () => {
    const result = buildTokenBenchmarkDatasetFromExecutionRecords({
      label: 'incomplete-execution-records',
      policy: { id: 'token-optimizer', version: 'candidate-v1' },
      source: 'codex',
      records: [
        executionRecord({ durationMs: null }),
        executionRecord({ variant: 'baseline', toolCalls: null }),
        executionRecord({ tokenUsage: null }),
      ],
    });

    assert.deepEqual(result, {
      status: 'unavailable',
      reason: 'required_measurement_unavailable',
      unavailable: [
        { index: 0, reason: 'duration_unavailable' },
        { index: 1, reason: 'tool_calls_unavailable' },
        { index: 2, reason: 'token_usage_unavailable' },
      ],
      dataset: null,
    });
  });

  it('returns a bounded result for an empty execution record collection', () => {
    assert.deepEqual(
      buildTokenBenchmarkDatasetFromExecutionRecords({
        label: 'empty-execution-records',
        policy: { id: 'token-optimizer', version: 'candidate-v1' },
        source: 'codex',
        records: [],
      }),
      { status: 'unavailable', reason: 'no_records', unavailable: [], dataset: null }
    );
  });

  it('retains duplicate-conflict validation at the dataset boundary', () => {
    assert.throws(() => buildTokenBenchmarkDatasetFromExecutionRecords({
      label: 'conflicting-execution-records',
      policy: { id: 'token-optimizer', version: 'candidate-v1' },
      source: 'codex',
      records: [
        executionRecord(),
        executionRecord({ durationMs: 501 }),
      ],
    }), /conflicting duplicate identity/);
  });

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
    assert.equal(result.decision, 'adopt_candidate');
    assert.deepEqual(result.policy, {
      baseline: { id: 'token-optimizer', version: 'before' },
      candidate: { id: 'token-optimizer', version: 'after' },
    });
    assert.equal(result.totalTokens.deltaPercent, -25);
  });

  it('rejects comparisons across unrelated optimizer policies', () => {
    assert.throws(
      () => compareTokenBenchmarks(
        dataset('before', [run('baseline')]),
        {
          ...dataset('after', [run('candidate')]),
          policy: { id: 'other-optimizer', version: 'after' },
        }
      ),
      /same policy id/
    );
  });

  it('rejects missing or unsafe policy metadata without echoing its value', () => {
    const { policy: _missingPolicy, ...missingPolicy } = dataset('missing-policy', [run('baseline')]);
    assert.throws(
      () => validateTokenBenchmarkDataset(missingPolicy),
      /dataset\.policy must be an object/
    );

    const unsafeValue = '../private-token';
    assert.throws(
      () => validateTokenBenchmarkDataset({
        ...dataset('unsafe-policy', [run('baseline')]),
        policy: { id: unsafeValue, version: 'v1' },
      }),
      (error: unknown) => error instanceof Error
        && /dataset\.policy\.id is invalid/.test(error.message)
        && !error.message.includes(unsafeValue)
    );
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

  it('fails when token reduction hides a cost regression', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [run('candidate', { costMicrousd: 120 })])
    );
    assert.equal(result.passed, false);
    assert.equal(result.decision, 'keep_baseline');
    assert.match(result.failures.join('\n'), /cost per completed task regression/);
  });

  it('fails closed when cost per completed task is unavailable', () => {
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [run('candidate', { costMicrousd: null })])
    );
    assert.equal(result.passed, false);
    assert.equal(result.decision, 'keep_baseline');
    assert.match(result.failures.join('\n'), /cost per completed task is unavailable/);
  });

  it('rejects an invalid cost regression threshold', () => {
    assert.throws(
      () => compareTokenBenchmarks(
        dataset('before', [run('baseline')]),
        dataset('after', [run('candidate')]),
        { maximumCostRegressionPercent: Number.NaN }
      ),
      /maximumCostRegressionPercent must be a finite non-negative number/
    );
    assert.throws(
      () => compareTokenBenchmarks(
        dataset('before', [run('baseline')]),
        dataset('after', [run('candidate')]),
        { maximumCostRegressionPercent: -1 }
      ),
      /maximumCostRegressionPercent must be a finite non-negative number/
    );
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
    assert.match(markdown, /Decision: adopt_candidate/);
    assert.match(markdown, /token-optimizer@before/);
    assert.match(markdown, /Total tokens/);
    assert.match(markdown, /Model calls/);
    assert.match(markdown, /Cost per completed task/);
    assert.match(markdown, /Scenario metrics/);
    assert.match(markdown, /small-change/);
  });

  it('reports deterministic per-scenario metrics in scenario-id order', () => {
    const scenarioIds = [...TOKEN_OPTIMIZATION_SCENARIO_IDS];
    const result = compareTokenOptimizationBenchmarks(
      dataset('before', [...scenarioIds].reverse().map((scenarioId) => run('baseline', { scenarioId }))),
      dataset('after', scenarioIds.map((scenarioId) => run('candidate', { scenarioId })))
    );

    assert.deepEqual(
      result.scenarioMetrics.map((scenario) => scenario.scenarioId),
      [...scenarioIds].sort()
    );
    assert.equal(result.scenarioMetrics[0].totalTokens.baselineMedian, 1000);
    assert.equal(result.scenarioMetrics[0].totalTokens.candidateMedian, 750);
    assert.equal(result.scenarioMetrics[0].totalTokens.deltaPercent, -25);
    assert.equal(result.scenarioMetrics[0].costPerCompletedTaskMicrousd.deltaPercent, -25);
  });

  it('exposes a per-scenario regression hidden by aggregate medians', () => {
    const scenarioIds = [...TOKEN_OPTIMIZATION_SCENARIO_IDS];
    const regressedScenario = scenarioIds[scenarioIds.length - 1];
    const candidateRuns = scenarioIds.map((scenarioId) => {
      const candidate = run('candidate', { scenarioId });
      const regressed = scenarioId === regressedScenario;
      candidate.durationMs = regressed ? 2_000 : 1_050;
      candidate.costMicrousd = regressed ? 200 : 75;
      candidate.tokenUsage = {
        ...candidate.tokenUsage,
        inputTokens: regressed ? 1_600 : 600,
        outputTokens: regressed ? 400 : 150,
        totalTokens: regressed ? 2_000 : 750,
      };
      return candidate;
    });
    const result = compareTokenOptimizationBenchmarks(
      dataset('before', scenarioIds.map((scenarioId) => run('baseline', { scenarioId }))),
      dataset('after', candidateRuns)
    );

    assert.equal(result.passed, true);
    const scenario = result.scenarioMetrics.find(({ scenarioId }) => scenarioId === regressedScenario);
    assert.ok(scenario);
    assert.equal(scenario.totalTokens.deltaPercent, 100);
    assert.equal(scenario.durationMs.deltaPercent, 100);
    assert.equal(scenario.costPerCompletedTaskMicrousd.deltaPercent, 100);
  });

  it('keeps unavailable scenario token and cost metrics explicit', () => {
    const candidate = run('candidate', {
      costMicrousd: null,
      tokenUsage: {
        ...run('candidate').tokenUsage,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        quality: 'unavailable',
      },
    });
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [candidate])
    );

    assert.deepEqual(result.scenarioMetrics[0].totalTokens, {
      baselineMedian: null,
      candidateMedian: null,
      delta: null,
      deltaPercent: null,
    });
    assert.equal(result.scenarioMetrics[0].costPerCompletedTaskMicrousd.deltaPercent, null);
    assert.match(formatBenchmarkMarkdown(result), /small-change.*n\/a/);
    assert.doesNotMatch(JSON.stringify(result), /prompt|response|command|path|credential|transcript|session/i);
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
    const comparison = compareTokenOptimizationBenchmarks(
      dataset('baseline', baselineRuns),
      dataset('candidate', candidateRuns)
    );
    assert.equal(comparison.decision, 'adopt_candidate');
    assert.throws(() => validateTokenOptimizationCorpus(
      dataset('baseline', baselineRuns.slice(0, -1)),
      dataset('candidate', candidateRuns)
    ), /all token optimization scenarios/);
    assert.throws(() => validateTokenOptimizationCorpus(
      dataset('baseline', baselineRuns),
      dataset('candidate', candidateRuns.map((candidateRun, index) => (
        index === 0 ? { ...candidateRun, repetition: 2 } : candidateRun
      )))
    ), /all token optimization scenarios/);
  });

  it('keeps the baseline when all token measurements are unavailable', () => {
    const unavailable = run('candidate', {
      tokenUsage: {
        ...run('candidate').tokenUsage,
        quality: 'unavailable',
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
      },
    });
    const result = compareTokenBenchmarks(
      dataset('before', [run('baseline')]),
      dataset('after', [unavailable])
    );
    assert.equal(result.passed, false);
    assert.equal(result.decision, 'keep_baseline');
    assert.equal(result.totalTokens.deltaPercent, null);
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
