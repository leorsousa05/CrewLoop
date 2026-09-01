import type { ClientTokenUsage } from '../types';

export type OptimizationRisk = 'low' | 'medium' | 'high';
export type OptimizationProfile = 'minimal' | 'balanced' | 'safe' | 'review';
export type ExecutionVariant = 'baseline' | 'candidate';
export type VerificationResult = 'passed' | 'failed' | 'not_run' | 'unavailable';
export type ExecutionOutcome = 'completed' | 'failed' | 'incomplete' | 'stopped';
export type ExecutionStopReason =
  | 'completed'
  | 'validation_failed'
  | 'validation_unavailable'
  | 'budget_exhausted'
  | 'retry_limit'
  | 'no_progress'
  | 'user_requested'
  | 'error';

export interface ExecutionBudget {
  maxContextTokens: number | null;
  maxOutputTokens: number | null;
  maxTurns: number;
  maxToolCalls: number;
  maxAttempts: number;
}

export interface TaskExecutionRecord {
  schemaVersion: 1;
  taskId: string;
  scenarioId: string;
  variant: ExecutionVariant;
  repetition: number;
  risk: OptimizationRisk;
  profile: OptimizationProfile;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  modelCalls: number | null;
  toolCalls: number | null;
  turns: number | null;
  attempts: number | null;
  failures: number | null;
  verification: VerificationResult;
  outcome: ExecutionOutcome;
  stopReason: ExecutionStopReason | null;
  tokenUsage: ClientTokenUsage | null;
  costMicrousd: number | null;
}

export interface OptimizationSelection {
  risk: OptimizationRisk;
  profile: OptimizationProfile;
}

export interface StopConditionInput {
  changeApplied: boolean;
  requiredValidation: 'passed' | 'failed' | 'pending' | 'unavailable';
  scopeRespected: boolean;
  mandatoryValidationPending: boolean;
  budgetExceeded: boolean;
  retryLimitReached: boolean;
  noProgressAttempts: number;
}

export interface StopDecision {
  action: 'continue' | 'complete' | 'stop';
  reason: ExecutionStopReason | null;
}

export const INITIAL_EXECUTION_BUDGETS: Readonly<Record<OptimizationRisk, ExecutionBudget>> = {
  low: {
    maxContextTokens: 12_000,
    maxOutputTokens: 4_000,
    maxTurns: 4,
    maxToolCalls: 12,
    maxAttempts: 1,
  },
  medium: {
    maxContextTokens: 24_000,
    maxOutputTokens: 8_000,
    maxTurns: 8,
    maxToolCalls: 24,
    maxAttempts: 2,
  },
  high: {
    maxContextTokens: 40_000,
    maxOutputTokens: 12_000,
    maxTurns: 12,
    maxToolCalls: 40,
    maxAttempts: 2,
  },
};

export const TOKEN_OPTIMIZATION_SCENARIO_IDS = [
  'docs-small',
  'cli-small',
  'dashboard-logic',
  'dashboard-ui',
  'security-boundary',
  'verification-failure',
] as const;

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const MAX_MODEL_LENGTH = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === 'string' && IDENTIFIER_PATTERN.test(value);
}

function isSafeCount(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0;
}

function isNullableSafeCount(value: unknown): value is number | null {
  return value === null || isSafeCount(value);
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null
    || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

function isOptimizationRisk(value: unknown): value is OptimizationRisk {
  return value === 'low' || value === 'medium' || value === 'high';
}

function isOptimizationProfile(value: unknown): value is OptimizationProfile {
  return value === 'minimal'
    || value === 'balanced'
    || value === 'safe'
    || value === 'review';
}

function isExecutionVariant(value: unknown): value is ExecutionVariant {
  return value === 'baseline' || value === 'candidate';
}

function isVerificationResult(value: unknown): value is VerificationResult {
  return value === 'passed'
    || value === 'failed'
    || value === 'not_run'
    || value === 'unavailable';
}

function isExecutionOutcome(value: unknown): value is ExecutionOutcome {
  return value === 'completed'
    || value === 'failed'
    || value === 'incomplete'
    || value === 'stopped';
}

function isExecutionStopReason(value: unknown): value is ExecutionStopReason {
  return value === 'completed'
    || value === 'validation_failed'
    || value === 'validation_unavailable'
    || value === 'budget_exhausted'
    || value === 'retry_limit'
    || value === 'no_progress'
    || value === 'user_requested'
    || value === 'error';
}

function isClientTokenUsage(value: unknown): value is ClientTokenUsage {
  if (!isRecord(value)) return false;
  const countKeys = [
    'inputTokens',
    'outputTokens',
    'cacheReadTokens',
    'cacheWriteTokens',
    'reasoningTokens',
    'totalTokens',
    'measurementCount',
    'rejectedMeasurementCount',
  ];
  if (!countKeys.every((key) => isSafeCount(value[key]))) return false;
  if (value.quality !== 'measured' && value.quality !== 'estimated' && value.quality !== 'unavailable') {
    return false;
  }
  return value.model === undefined
    || (typeof value.model === 'string' && value.model.length > 0 && value.model.length <= MAX_MODEL_LENGTH);
}

export function validateTaskExecutionRecord(value: unknown): TaskExecutionRecord {
  if (!isRecord(value)) throw new Error('execution record must be an object');
  if (value.schemaVersion !== 1) throw new Error('execution record schemaVersion must be 1');
  if (!isBoundedIdentifier(value.taskId)) throw new Error('execution record taskId is invalid');
  if (!isBoundedIdentifier(value.scenarioId)) throw new Error('execution record scenarioId is invalid');
  if (!isExecutionVariant(value.variant)) throw new Error('execution record variant is invalid');
  if (!isSafeCount(value.repetition) || value.repetition < 1) {
    throw new Error('execution record repetition must be a positive safe integer');
  }
  if (!isOptimizationRisk(value.risk)) throw new Error('execution record risk is invalid');
  if (!isOptimizationProfile(value.profile)) throw new Error('execution record profile is invalid');
  if (!isSafeCount(value.startedAt)) throw new Error('execution record startedAt is invalid');
  if (value.endedAt !== null && (!isSafeCount(value.endedAt) || value.endedAt < value.startedAt)) {
    throw new Error('execution record endedAt is invalid');
  }
  if (!isNullableFiniteNumber(value.durationMs)) throw new Error('execution record durationMs is invalid');
  for (const key of ['modelCalls', 'toolCalls', 'turns', 'attempts', 'failures']) {
    if (!isNullableSafeCount(value[key])) {
      throw new Error(`execution record ${key} is invalid`);
    }
  }
  if (!isVerificationResult(value.verification)) throw new Error('execution record verification is invalid');
  if (!isExecutionOutcome(value.outcome)) throw new Error('execution record outcome is invalid');
  if (value.stopReason !== null && !isExecutionStopReason(value.stopReason)) {
    throw new Error('execution record stopReason is invalid');
  }
  if (value.tokenUsage !== null && !isClientTokenUsage(value.tokenUsage)) {
    throw new Error('execution record tokenUsage is invalid');
  }
  if (!isNullableSafeCount(value.costMicrousd)) {
    throw new Error('execution record costMicrousd is invalid');
  }
  return value as unknown as TaskExecutionRecord;
}

export function selectOptimizationProfile(
  input: Partial<OptimizationSelection> = {}
): OptimizationSelection {
  const risk = isOptimizationRisk(input.risk) ? input.risk : 'low';
  if (isOptimizationProfile(input.profile)) {
    return { risk, profile: input.profile };
  }
  return { risk, profile: risk === 'high' ? 'safe' : 'balanced' };
}

export function getInitialExecutionBudget(risk: OptimizationRisk): ExecutionBudget {
  return { ...INITIAL_EXECUTION_BUDGETS[risk] };
}

export function evaluateStopCondition(input: StopConditionInput): StopDecision {
  if (input.requiredValidation === 'failed') {
    return { action: 'stop', reason: 'validation_failed' };
  }
  if (input.requiredValidation === 'unavailable') {
    return { action: 'stop', reason: 'validation_unavailable' };
  }
  if (input.budgetExceeded) {
    return { action: 'stop', reason: 'budget_exhausted' };
  }
  if (input.retryLimitReached) {
    return { action: 'stop', reason: 'retry_limit' };
  }
  if (input.noProgressAttempts >= 2) {
    return { action: 'stop', reason: 'no_progress' };
  }
  if (
    input.changeApplied
    && input.requiredValidation === 'passed'
    && input.scopeRespected
    && !input.mandatoryValidationPending
  ) {
    return { action: 'complete', reason: 'completed' };
  }
  return { action: 'continue', reason: null };
}
