import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateStopCondition,
  getInitialExecutionBudget,
  selectOptimizationProfile,
  validateTaskExecutionRecord,
  type TaskExecutionRecord,
} from './execution';

function record(overrides: Partial<TaskExecutionRecord> = {}): TaskExecutionRecord {
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
    modelCalls: null,
    toolCalls: 2,
    turns: null,
    attempts: 1,
    failures: 0,
    verification: 'passed',
    outcome: 'completed',
    stopReason: 'completed',
    tokenUsage: null,
    costMicrousd: null,
    ...overrides,
  };
}

const stopInput = {
  changeApplied: true,
  requiredValidation: 'passed' as const,
  scopeRespected: true,
  mandatoryValidationPending: false,
  budgetExceeded: false,
  retryLimitReached: false,
  noProgressAttempts: 0,
};

describe('task execution telemetry', () => {
  it('accepts null metrics and preserves measured zero values', () => {
    const result = validateTaskExecutionRecord(record({
      toolCalls: 0,
      failures: 0,
      tokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        reasoningTokens: 0,
        totalTokens: 0,
        quality: 'measured',
        measurementCount: 1,
        rejectedMeasurementCount: 0,
      },
    }));

    assert.equal(result.modelCalls, null);
    assert.equal(result.toolCalls, 0);
    assert.equal(result.tokenUsage?.quality, 'measured');
    assert.equal(result.tokenUsage?.totalTokens, 0);
  });

  it('rejects unsafe identifiers, invalid counters, and free-form stop reasons', () => {
    assert.throws(() => validateTaskExecutionRecord(record({ taskId: '../secret' })), /taskId/);
    assert.throws(() => validateTaskExecutionRecord(record({ toolCalls: -1 })), /toolCalls/);
    assert.throws(() => validateTaskExecutionRecord(record({ durationMs: Number.NaN })), /durationMs/);
    assert.throws(() => validateTaskExecutionRecord(record({ stopReason: 'rm -rf workspace' as never })), /stopReason/);
  });

  it('selects balanced by default and safe for high-risk work', () => {
    assert.deepEqual(selectOptimizationProfile(), { risk: 'low', profile: 'balanced' });
    assert.deepEqual(selectOptimizationProfile({ risk: 'high' }), { risk: 'high', profile: 'safe' });
    assert.deepEqual(selectOptimizationProfile({ risk: 'medium', profile: 'minimal' }), {
      risk: 'medium',
      profile: 'minimal',
    });
  });

  it('escalates a weaker requested profile for high-risk work', () => {
    assert.deepEqual(selectOptimizationProfile({ risk: 'high', profile: 'minimal' }), {
      risk: 'high',
      profile: 'safe',
    });
    assert.deepEqual(selectOptimizationProfile({ risk: 'high', profile: 'balanced' }), {
      risk: 'high',
      profile: 'safe',
    });
  });

  it('returns the proposed budgets without enforcing them', () => {
    assert.deepEqual(getInitialExecutionBudget('low'), {
      maxContextTokens: 12_000,
      maxOutputTokens: 4_000,
      maxTurns: 4,
      maxToolCalls: 12,
      maxAttempts: 1,
    });
  });

  it('completes only after required validation and scope checks pass', () => {
    assert.deepEqual(evaluateStopCondition(stopInput), {
      action: 'complete',
      reason: 'completed',
    });
    assert.deepEqual(evaluateStopCondition({ ...stopInput, scopeRespected: false }), {
      action: 'continue',
      reason: null,
    });
  });

  it('stops validation failures, exhausted budgets, and no-progress retries', () => {
    assert.equal(evaluateStopCondition({ ...stopInput, requiredValidation: 'failed' }).reason, 'validation_failed');
    assert.equal(evaluateStopCondition({ ...stopInput, budgetExceeded: true }).reason, 'budget_exhausted');
    assert.equal(evaluateStopCondition({ ...stopInput, noProgressAttempts: 2 }).reason, 'no_progress');
  });
});
