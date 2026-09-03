import type { AgentSource, ClientTokenUsage } from '../types';
import {
  TOKEN_OPTIMIZATION_SCENARIO_IDS,
  type ExecutionOutcome,
  type ExecutionStopReason,
  type OptimizationProfile,
  type OptimizationRisk,
  type VerificationResult,
  validateTaskExecutionRecord,
} from './execution';

export interface TokenBenchmarkRun {
  schemaVersion: 1;
  scenarioId: string;
  variant: 'baseline' | 'candidate';
  repetition: number;
  model?: string;
  source: AgentSource;
  passed: boolean;
  durationMs: number;
  toolCalls: number;
  risk?: OptimizationRisk;
  profile?: OptimizationProfile;
  modelCalls?: number | null;
  turns?: number | null;
  attempts?: number | null;
  failures?: number | null;
  verification?: VerificationResult;
  outcome?: ExecutionOutcome;
  stopReason?: ExecutionStopReason | null;
  costMicrousd?: number | null;
  tokenUsage: ClientTokenUsage;
}

export type TaskExecutionBenchmarkProjection =
  | {
    status: 'ready';
    run: TokenBenchmarkRun;
  }
  | {
    status: 'unavailable';
    reason: 'token_usage_unavailable' | 'duration_unavailable' | 'tool_calls_unavailable';
  };

export interface TaskExecutionBenchmarkDatasetInput {
  label: string;
  policy: TokenBenchmarkPolicy;
  source: AgentSource;
  records: readonly unknown[];
}

export type TaskExecutionBenchmarkUnavailableReason =
  | 'token_usage_unavailable'
  | 'duration_unavailable'
  | 'tool_calls_unavailable';

export interface TaskExecutionBenchmarkUnavailableRecord {
  index: number;
  reason: TaskExecutionBenchmarkUnavailableReason;
}

export type TaskExecutionBenchmarkDatasetProjection =
  | {
    status: 'ready';
    dataset: TokenBenchmarkDataset;
  }
  | {
    status: 'unavailable';
    reason: 'no_records' | 'required_measurement_unavailable';
    unavailable: TaskExecutionBenchmarkUnavailableRecord[];
    dataset: null;
  };

export interface TokenBenchmarkDataset {
  schemaVersion: 1;
  label: string;
  policy: TokenBenchmarkPolicy;
  runs: TokenBenchmarkRun[];
}

export interface TokenBenchmarkPolicy {
  id: string;
  version: string;
}

export type TokenOptimizationDecision = 'adopt_candidate' | 'keep_baseline';

export interface TokenBenchmarkConfig {
  minimumTokenReductionPercent: number;
  minimumMeasuredCoveragePercent: number;
  maximumDurationRegressionPercent: number;
  maximumCostRegressionPercent: number;
  requireCandidateSuccessForPassingBaseline: boolean;
}

export interface TokenMetricComparison {
  baselineMedian: number | null;
  candidateMedian: number | null;
  delta: number | null;
  deltaPercent: number | null;
}

export interface NullableMetricComparison {
  baselineMedian: number | null;
  candidateMedian: number | null;
  delta: number | null;
  deltaPercent: number | null;
}

export interface ExecutionMetricComparison {
  modelCalls: NullableMetricComparison;
  toolCalls: TokenMetricComparison;
  turns: NullableMetricComparison;
  attempts: NullableMetricComparison;
  failures: NullableMetricComparison;
  durationMs: TokenMetricComparison;
  costMicrousd: NullableMetricComparison;
  costPerCompletedTaskMicrousd: NullableMetricComparison;
}

export interface TokenBenchmarkComparison {
  policy: {
    baseline: TokenBenchmarkPolicy;
    candidate: TokenBenchmarkPolicy;
  };
  decision: TokenOptimizationDecision;
  passed: boolean;
  totalTokens: TokenMetricComparison;
  inputTokens: TokenMetricComparison;
  outputTokens: TokenMetricComparison;
  durationMs: TokenMetricComparison;
  execution: ExecutionMetricComparison;
  baselineSuccessRate: number;
  candidateSuccessRate: number;
  measuredCoveragePercent: number;
  failures: string[];
}

export const DEFAULT_TOKEN_BENCHMARK_CONFIG: TokenBenchmarkConfig = {
  minimumTokenReductionPercent: 15,
  minimumMeasuredCoveragePercent: 95,
  maximumDurationRegressionPercent: 10,
  maximumCostRegressionPercent: 0,
  requireCandidateSuccessForPassingBaseline: true,
};

const AGENT_SOURCES: ReadonlySet<string> = new Set([
  'kimi',
  'claude',
  'codex',
  'opencode',
  'log-watcher',
  'agy',
]);

export function projectTaskExecutionRecord(
  value: unknown,
  source: AgentSource
): TaskExecutionBenchmarkProjection {
  const record = validateTaskExecutionRecord(value);
  if (!AGENT_SOURCES.has(source)) throw new Error('benchmark projection source is invalid');
  if (record.tokenUsage === null) return { status: 'unavailable', reason: 'token_usage_unavailable' };
  if (record.durationMs === null) return { status: 'unavailable', reason: 'duration_unavailable' };
  if (record.toolCalls === null) return { status: 'unavailable', reason: 'tool_calls_unavailable' };

  return {
    status: 'ready',
    run: {
      schemaVersion: 1,
      scenarioId: record.scenarioId,
      variant: record.variant,
      repetition: record.repetition,
      model: record.tokenUsage.model,
      source,
      passed: record.verification === 'passed' && record.outcome === 'completed',
      durationMs: record.durationMs,
      toolCalls: record.toolCalls,
      risk: record.risk,
      profile: record.profile,
      modelCalls: record.modelCalls,
      turns: record.turns,
      attempts: record.attempts,
      failures: record.failures,
      verification: record.verification,
      outcome: record.outcome,
      stopReason: record.stopReason,
      costMicrousd: record.costMicrousd,
      tokenUsage: record.tokenUsage,
    },
  };
}

export function buildTokenBenchmarkDatasetFromExecutionRecords(
  input: TaskExecutionBenchmarkDatasetInput
): TaskExecutionBenchmarkDatasetProjection {
  if (input.records.length === 0) {
    return { status: 'unavailable', reason: 'no_records', unavailable: [], dataset: null };
  }

  const runs: TokenBenchmarkRun[] = [];
  const unavailable: TaskExecutionBenchmarkUnavailableRecord[] = [];
  for (const [index, record] of input.records.entries()) {
    const projection = projectTaskExecutionRecord(record, input.source);
    if (projection.status === 'ready') runs.push(projection.run);
    else unavailable.push({ index, reason: projection.reason });
  }

  if (unavailable.length > 0) {
    return {
      status: 'unavailable',
      reason: 'required_measurement_unavailable',
      unavailable,
      dataset: null,
    };
  }

  const dataset = validateTokenBenchmarkDataset({
    schemaVersion: 1,
    label: input.label,
    policy: input.policy,
    runs,
  });
  return { status: 'ready', dataset };
}

const POLICY_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return isNonNegativeNumber(value) && Number.isSafeInteger(value);
}

function isBoundedPolicyIdentifier(value: unknown): value is string {
  return typeof value === 'string' && POLICY_IDENTIFIER_PATTERN.test(value);
}

function validatePolicy(value: unknown, path: string): asserts value is TokenBenchmarkPolicy {
  if (!isObject(value)) {
    throw new Error(`${path} must be an object`);
  }
  if (!isBoundedPolicyIdentifier(value.id)) {
    throw new Error(`${path}.id is invalid`);
  }
  if (!isBoundedPolicyIdentifier(value.version)) {
    throw new Error(`${path}.version is invalid`);
  }
}

function isNullableNonNegativeInteger(value: unknown): value is number | null {
  return value === null || isNonNegativeInteger(value);
}

function isNullableNonNegativeNumber(value: unknown): value is number | null {
  return value === null || isNonNegativeNumber(value);
}

function validateTokenUsage(value: unknown, path: string): asserts value is ClientTokenUsage {
  if (!isObject(value)) {
    throw new Error(`${path} must be an object`);
  }
  for (const key of [
    'inputTokens',
    'outputTokens',
    'cacheReadTokens',
    'cacheWriteTokens',
    'reasoningTokens',
    'totalTokens',
    'measurementCount',
    'rejectedMeasurementCount',
  ]) {
    if (!isNonNegativeInteger(value[key])) {
      throw new Error(`${path}.${key} must be a non-negative safe integer`);
    }
  }
  if (!['measured', 'estimated', 'unavailable'].includes(String(value.quality))) {
    throw new Error(`${path}.quality is invalid`);
  }
  if (value.model !== undefined && (typeof value.model !== 'string' || value.model.length > 200)) {
    throw new Error(`${path}.model is invalid`);
  }
}

function validateRun(value: unknown, path: string): asserts value is TokenBenchmarkRun {
  if (!isObject(value)) {
    throw new Error(`${path} must be an object`);
  }
  if (value.schemaVersion !== 1) {
    throw new Error(`${path}.schemaVersion must be 1`);
  }
  if (typeof value.scenarioId !== 'string' || value.scenarioId.length === 0) {
    throw new Error(`${path}.scenarioId must be a non-empty string`);
  }
  if (value.variant !== 'baseline' && value.variant !== 'candidate') {
    throw new Error(`${path}.variant must be baseline or candidate`);
  }
  if (!isNonNegativeInteger(value.repetition)) {
    throw new Error(`${path}.repetition must be a non-negative safe integer`);
  }
  if (typeof value.source !== 'string' || !AGENT_SOURCES.has(value.source)) {
    throw new Error(`${path}.source is invalid`);
  }
  if (typeof value.passed !== 'boolean') {
    throw new Error(`${path}.passed must be a boolean`);
  }
  if (!isNonNegativeNumber(value.durationMs)) {
    throw new Error(`${path}.durationMs must be a non-negative number`);
  }
  if (!isNonNegativeInteger(value.toolCalls)) {
    throw new Error(`${path}.toolCalls must be a non-negative safe integer`);
  }
  if (value.risk !== undefined && !['low', 'medium', 'high'].includes(String(value.risk))) {
    throw new Error(`${path}.risk is invalid`);
  }
  if (value.profile !== undefined && !['minimal', 'balanced', 'safe', 'review'].includes(String(value.profile))) {
    throw new Error(`${path}.profile is invalid`);
  }
  for (const key of ['modelCalls', 'turns', 'attempts', 'failures']) {
    if (value[key] !== undefined && !isNullableNonNegativeInteger(value[key])) {
      throw new Error(`${path}.${key} must be null or a non-negative safe integer`);
    }
  }
  if (value.verification !== undefined && !['passed', 'failed', 'not_run', 'unavailable'].includes(String(value.verification))) {
    throw new Error(`${path}.verification is invalid`);
  }
  if (value.outcome !== undefined && !['completed', 'failed', 'incomplete', 'stopped'].includes(String(value.outcome))) {
    throw new Error(`${path}.outcome is invalid`);
  }
  if (value.stopReason !== undefined && value.stopReason !== null && ![
    'completed',
    'validation_failed',
    'validation_unavailable',
    'budget_exhausted',
    'retry_limit',
    'no_progress',
    'user_requested',
    'error',
  ].includes(String(value.stopReason))) {
    throw new Error(`${path}.stopReason is invalid`);
  }
  if (value.costMicrousd !== undefined && !isNullableNonNegativeInteger(value.costMicrousd)) {
    throw new Error(`${path}.costMicrousd must be null or a non-negative safe integer`);
  }
  validateTokenUsage(value.tokenUsage, `${path}.tokenUsage`);
}

export function validateTokenBenchmarkDataset(value: unknown): TokenBenchmarkDataset {
  if (!isObject(value)) {
    throw new Error('dataset must be an object');
  }
  if (value.schemaVersion !== 1) {
    throw new Error('dataset.schemaVersion must be 1');
  }
  if (typeof value.label !== 'string' || value.label.length === 0) {
    throw new Error('dataset.label must be a non-empty string');
  }
  validatePolicy(value.policy, 'dataset.policy');
  if (!Array.isArray(value.runs) || value.runs.length === 0) {
    throw new Error('dataset.runs must be a non-empty array');
  }
  const fingerprints = new Map<string, string>();
  const validatedRuns: TokenBenchmarkRun[] = [];
  value.runs.forEach((run, index) => {
    validateRun(run, `dataset.runs[${index}]`);
    const typedRun = run as TokenBenchmarkRun;
    const identity = `${typedRun.variant}:${typedRun.scenarioId}:${typedRun.repetition}`;
    const fingerprint = benchmarkRunFingerprint(typedRun);
    const previous = fingerprints.get(identity);
    if (previous !== undefined) {
      if (previous !== fingerprint) {
        throw new Error(`dataset.runs contains conflicting duplicate identity ${identity}`);
      }
      return;
    }
    fingerprints.set(identity, fingerprint);
    validatedRuns.push(typedRun);
  });
  return { ...value, runs: validatedRuns } as unknown as TokenBenchmarkDataset;
}

export function validateTokenOptimizationCorpus(
  rawBaseline: TokenBenchmarkDataset,
  rawCandidate: TokenBenchmarkDataset
): void {
  const baseline = validateTokenBenchmarkDataset(rawBaseline);
  const candidate = validateTokenBenchmarkDataset(rawCandidate);
  if (baseline.policy.id !== candidate.policy.id) {
    throw new Error('benchmark policies must share the same policy id');
  }
  const expected = [...TOKEN_OPTIMIZATION_SCENARIO_IDS].sort();
  const baselineIds = scenarioIds(baseline.runs);
  const candidateIds = scenarioIds(candidate.runs);
  if (
    !sameStrings(baselineIds, expected)
    || !sameStrings(candidateIds, expected)
    || !sameStrings(runCoverage(baseline.runs), runCoverage(candidate.runs))
  ) {
    throw new Error('benchmark corpus must contain all token optimization scenarios in both variants');
  }
}

export function compareTokenOptimizationBenchmarks(
  rawBaseline: TokenBenchmarkDataset,
  rawCandidate: TokenBenchmarkDataset,
  overrides: Partial<TokenBenchmarkConfig> = {}
): TokenBenchmarkComparison {
  validateTokenOptimizationCorpus(rawBaseline, rawCandidate);
  return compareTokenBenchmarks(rawBaseline, rawCandidate, overrides);
}

export function deduplicateTokenBenchmarkRuns(
  runs: readonly TokenBenchmarkRun[]
): TokenBenchmarkRun[] {
  const identities = new Set<string>();
  return runs.filter((run) => {
    const identity = `${run.variant}:${run.scenarioId}:${run.repetition}`;
    if (identities.has(identity)) return false;
    identities.add(identity);
    return true;
  });
}

function benchmarkRunFingerprint(run: TokenBenchmarkRun): string {
  return JSON.stringify({
    schemaVersion: run.schemaVersion,
    scenarioId: run.scenarioId,
    variant: run.variant,
    repetition: run.repetition,
    model: run.model,
    source: run.source,
    passed: run.passed,
    durationMs: run.durationMs,
    toolCalls: run.toolCalls,
    risk: run.risk,
    profile: run.profile,
    modelCalls: run.modelCalls,
    turns: run.turns,
    attempts: run.attempts,
    failures: run.failures,
    verification: run.verification,
    outcome: run.outcome,
    stopReason: run.stopReason,
    costMicrousd: run.costMicrousd,
    tokenUsage: run.tokenUsage,
  });
}

export function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error('median requires at least one value');
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function compareMetric(baseline: number[], candidate: number[]): TokenMetricComparison {
  const baselineMedian = median(baseline);
  const candidateMedian = median(candidate);
  const delta = candidateMedian - baselineMedian;
  const deltaPercent = baselineMedian === 0
    ? (candidateMedian === 0 ? 0 : Number.POSITIVE_INFINITY)
    : (delta / baselineMedian) * 100;
  return { baselineMedian, candidateMedian, delta, deltaPercent };
}

function compareMetricOrEmpty(baseline: number[], candidate: number[]): TokenMetricComparison {
  if (baseline.length === 0 || candidate.length === 0) {
    return {
      baselineMedian: null,
      candidateMedian: null,
      delta: null,
      deltaPercent: null,
    };
  }
  return compareMetric(baseline, candidate);
}

function emptyNullableMetric(): NullableMetricComparison {
  return {
    baselineMedian: null,
    candidateMedian: null,
    delta: null,
    deltaPercent: null,
  };
}

function compareNullableMetric(
  baseline: Array<number | null | undefined>,
  candidate: Array<number | null | undefined>
): NullableMetricComparison {
  const baselineValues = baseline.filter((value): value is number => value !== null && value !== undefined);
  const candidateValues = candidate.filter((value): value is number => value !== null && value !== undefined);
  if (baselineValues.length === 0 || candidateValues.length === 0) return emptyNullableMetric();
  const result = compareMetric(baselineValues, candidateValues);
  return result;
}

function costPerCompletedTask(runs: TokenBenchmarkRun[]): number | null {
  const completed = runs.filter((run) => run.passed);
  if (completed.length === 0 || completed.some((run) => run.costMicrousd === undefined || run.costMicrousd === null)) {
    return null;
  }
  const total = completed.reduce((sum, run) => sum + (run.costMicrousd as number), 0);
  return Number.isSafeInteger(total) ? total / completed.length : null;
}

function successRate(runs: TokenBenchmarkRun[]): number {
  return (runs.filter((run) => run.passed).length / runs.length) * 100;
}

function measuredCoverage(runs: TokenBenchmarkRun[]): number {
  return (runs.filter((run) => run.tokenUsage.quality === 'measured').length / runs.length) * 100;
}

function scenarioIds(runs: TokenBenchmarkRun[]): string[] {
  return Array.from(new Set(runs.map((run) => run.scenarioId))).sort();
}

function runCoverage(runs: TokenBenchmarkRun[]): string[] {
  return Array.from(new Set(runs.map((run) => `${run.scenarioId}:${run.repetition}`))).sort();
}

function sameStrings(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validateBenchmarkConfig(config: TokenBenchmarkConfig): void {
  if (!Number.isFinite(config.maximumCostRegressionPercent) || config.maximumCostRegressionPercent < 0) {
    throw new Error('maximumCostRegressionPercent must be a finite non-negative number');
  }
}

export function compareTokenBenchmarks(
  rawBaseline: TokenBenchmarkDataset,
  rawCandidate: TokenBenchmarkDataset,
  overrides: Partial<TokenBenchmarkConfig> = {}
): TokenBenchmarkComparison {
  const baseline = validateTokenBenchmarkDataset(rawBaseline);
  const candidate = validateTokenBenchmarkDataset(rawCandidate);
  const config = { ...DEFAULT_TOKEN_BENCHMARK_CONFIG, ...overrides };
  validateBenchmarkConfig(config);
  const failures: string[] = [];

  if (!sameStrings(scenarioIds(baseline.runs), scenarioIds(candidate.runs))) {
    throw new Error('baseline and candidate scenario sets/coverage must match');
  }
  if (!sameStrings(runCoverage(baseline.runs), runCoverage(candidate.runs))) {
    throw new Error('baseline and candidate scenario sets/coverage must match');
  }
  if (baseline.runs.some((run) => run.variant !== 'baseline')) {
    throw new Error('baseline dataset may contain only baseline runs');
  }
  if (candidate.runs.some((run) => run.variant !== 'candidate')) {
    throw new Error('candidate dataset may contain only candidate runs');
  }
  if (baseline.policy.id !== candidate.policy.id) {
    throw new Error('benchmark policies must share the same policy id');
  }

  const measuredBaseline = baseline.runs.filter((run) => run.tokenUsage.quality === 'measured');
  const measuredCandidate = candidate.runs.filter((run) => run.tokenUsage.quality === 'measured');

  const totalTokens = compareMetricOrEmpty(
    measuredBaseline.map((run) => run.tokenUsage.totalTokens),
    measuredCandidate.map((run) => run.tokenUsage.totalTokens)
  );
  const inputTokens = compareMetricOrEmpty(
    measuredBaseline.map((run) => run.tokenUsage.inputTokens),
    measuredCandidate.map((run) => run.tokenUsage.inputTokens)
  );
  const outputTokens = compareMetricOrEmpty(
    measuredBaseline.map((run) => run.tokenUsage.outputTokens),
    measuredCandidate.map((run) => run.tokenUsage.outputTokens)
  );
  const durationMs = compareMetric(
    baseline.runs.map((run) => run.durationMs),
    candidate.runs.map((run) => run.durationMs)
  );
  const execution: ExecutionMetricComparison = {
    modelCalls: compareNullableMetric(
      baseline.runs.map((run) => run.modelCalls),
      candidate.runs.map((run) => run.modelCalls)
    ),
    toolCalls: compareMetric(
      baseline.runs.map((run) => run.toolCalls),
      candidate.runs.map((run) => run.toolCalls)
    ),
    turns: compareNullableMetric(
      baseline.runs.map((run) => run.turns),
      candidate.runs.map((run) => run.turns)
    ),
    attempts: compareNullableMetric(
      baseline.runs.map((run) => run.attempts),
      candidate.runs.map((run) => run.attempts)
    ),
    failures: compareNullableMetric(
      baseline.runs.map((run) => run.failures),
      candidate.runs.map((run) => run.failures)
    ),
    durationMs,
    costMicrousd: compareNullableMetric(
      baseline.runs.map((run) => run.costMicrousd),
      candidate.runs.map((run) => run.costMicrousd)
    ),
    costPerCompletedTaskMicrousd: compareNullableMetric(
      [costPerCompletedTask(baseline.runs)],
      [costPerCompletedTask(candidate.runs)]
    ),
  };
  const baselineSuccessRate = successRate(baseline.runs);
  const candidateSuccessRate = successRate(candidate.runs);
  const measuredCoveragePercent = Math.min(
    measuredCoverage(baseline.runs),
    measuredCoverage(candidate.runs)
  );
  const reductionPercent = totalTokens.deltaPercent === null ? null : -totalTokens.deltaPercent;

  if (reductionPercent === null) {
    failures.push('measured token coverage is unavailable for comparison');
  } else if (reductionPercent < config.minimumTokenReductionPercent) {
    failures.push(
      `token reduction ${reductionPercent.toFixed(2)}% is below ${config.minimumTokenReductionPercent}%`
    );
  }
  if (measuredCoveragePercent < config.minimumMeasuredCoveragePercent) {
    failures.push(
      `measured coverage ${measuredCoveragePercent.toFixed(2)}% is below ${config.minimumMeasuredCoveragePercent}%`
    );
  }
  if (durationMs.deltaPercent !== null && durationMs.deltaPercent > config.maximumDurationRegressionPercent) {
    failures.push(
      `duration regression ${durationMs.deltaPercent.toFixed(2)}% exceeds ${config.maximumDurationRegressionPercent}%`
    );
  }
  const costPerCompletedTaskMetric = execution.costPerCompletedTaskMicrousd;
  if (costPerCompletedTaskMetric.deltaPercent === null) {
    failures.push('cost per completed task is unavailable for comparison');
  } else if (costPerCompletedTaskMetric.deltaPercent > config.maximumCostRegressionPercent) {
    failures.push(
      `cost per completed task regression ${costPerCompletedTaskMetric.deltaPercent.toFixed(2)}% exceeds ${config.maximumCostRegressionPercent}%`
    );
  }
  if (
    config.requireCandidateSuccessForPassingBaseline
    && baselineSuccessRate > 0
    && candidateSuccessRate < 100
  ) {
    failures.push('candidate must pass every run when the baseline has passing runs');
  }

  return {
    policy: {
      baseline: baseline.policy,
      candidate: candidate.policy,
    },
    decision: failures.length === 0 ? 'adopt_candidate' : 'keep_baseline',
    passed: failures.length === 0,
    totalTokens,
    inputTokens,
    outputTokens,
    durationMs,
    execution,
    baselineSuccessRate,
    candidateSuccessRate,
    measuredCoveragePercent,
    failures,
  };
}

function formatNumber(value: number | null): string {
  return value === null ? 'n/a' : Number.isFinite(value) ? value.toFixed(2) : String(value);
}

export function formatBenchmarkMarkdown(comparison: TokenBenchmarkComparison): string {
  const rows = [
    ['Total tokens', comparison.totalTokens],
    ['Input tokens', comparison.inputTokens],
    ['Output tokens', comparison.outputTokens],
    ['Duration (ms)', comparison.durationMs],
  ];
  const lines = [
    `# Token Benchmark: ${comparison.passed ? 'PASS' : 'FAIL'}`,
    '',
    '| Metric | Baseline median | Candidate median | Delta % |',
    '|---|---:|---:|---:|',
    ...rows.map(([label, metric]) => {
      const value = metric as TokenMetricComparison;
      return `| ${label} | ${formatNumber(value.baselineMedian)} | ${formatNumber(value.candidateMedian)} | ${formatNumber(value.deltaPercent)}% |`;
    }),
    '',
    `- Baseline success: ${formatNumber(comparison.baselineSuccessRate)}%`,
    `- Candidate success: ${formatNumber(comparison.candidateSuccessRate)}%`,
    `- Measured coverage: ${formatNumber(comparison.measuredCoveragePercent)}%`,
    `- Baseline policy: ${comparison.policy.baseline.id}@${comparison.policy.baseline.version}`,
    `- Candidate policy: ${comparison.policy.candidate.id}@${comparison.policy.candidate.version}`,
    `- Decision: ${comparison.decision}`,
    '',
    '## Execution metrics',
    '',
    '| Metric | Baseline median | Candidate median | Delta % |',
    '|---|---:|---:|---:|',
    ...[
      ['Model calls', comparison.execution.modelCalls],
      ['Tool calls', comparison.execution.toolCalls],
      ['Turns', comparison.execution.turns],
      ['Attempts', comparison.execution.attempts],
      ['Failures', comparison.execution.failures],
      ['Cost (micro-USD)', comparison.execution.costMicrousd],
      ['Cost per completed task (micro-USD)', comparison.execution.costPerCompletedTaskMicrousd],
    ].map(([label, metric]) => {
      const value = metric as NullableMetricComparison | TokenMetricComparison;
      const delta = formatNumber(value.deltaPercent);
      return `| ${label} | ${formatNumber(value.baselineMedian)} | ${formatNumber(value.candidateMedian)} | ${delta === 'n/a' ? delta : `${delta}%`} |`;
    }),
  ];
  if (comparison.failures.length > 0) {
    lines.push('', '## Failures', ...comparison.failures.map((failure) => `- ${failure}`));
  }
  return `${lines.join('\n')}\n`;
}
