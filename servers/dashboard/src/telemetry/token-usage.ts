import type {
  AgentSource,
  ClientTokenUsage,
  SessionTokenUsage,
  TokenCounterSemantics,
  TokenUsageCounts,
  TokenUsageMeasurement,
} from '../types';

const AGENT_SOURCES: ReadonlySet<string> = new Set([
  'kimi',
  'claude',
  'codex',
  'opencode',
  'log-watcher',
  'agy',
]);

const MAX_MEASUREMENT_IDS = 256;
const MAX_METADATA_LENGTH = 200;

export interface TokenUsageAliases {
  input: readonly string[];
  output: readonly string[];
  cacheRead: readonly string[];
  cacheWrite: readonly string[];
  reasoning: readonly string[];
  total: readonly string[];
}

export interface NormalizeTokenUsageInput {
  source: AgentSource;
  rawUsage: unknown;
  model?: string;
  eventId: string;
  capturedAt: number;
  semantics: TokenCounterSemantics;
  aliases: TokenUsageAliases;
}

export interface MergeTokenUsageResult {
  aggregate: SessionTokenUsage;
  accepted: boolean;
  reason?: 'duplicate' | 'invalid' | 'stale';
}

const ZERO_COUNTS: TokenUsageCounts = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
  totalTokens: 0,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTokenCount(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0;
}

function readCount(
  usage: Record<string, unknown>,
  aliases: readonly string[]
): { found: boolean; value: number } {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(usage, alias)) {
      const value = usage[alias];
      return isTokenCount(value)
        ? { found: true, value }
        : { found: true, value: Number.NaN };
    }
  }
  return { found: false, value: 0 };
}

function isBoundedString(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= MAX_METADATA_LENGTH;
}

function hasValidCounts(value: Record<string, unknown>): boolean {
  return isTokenCount(value.inputTokens)
    && isTokenCount(value.outputTokens)
    && isTokenCount(value.cacheReadTokens)
    && isTokenCount(value.cacheWriteTokens)
    && isTokenCount(value.reasoningTokens)
    && isTokenCount(value.totalTokens);
}

export function normalizeTokenUsage(
  input: NormalizeTokenUsageInput
): TokenUsageMeasurement | undefined {
  if (!isPlainObject(input.rawUsage) || !isBoundedString(input.eventId)) {
    return undefined;
  }
  if (!Number.isSafeInteger(input.capturedAt) || input.capturedAt < 0) {
    return undefined;
  }
  if (input.model !== undefined && !isBoundedString(input.model)) {
    return undefined;
  }

  const usage = input.rawUsage;
  const inputCount = readCount(usage, input.aliases.input);
  const outputCount = readCount(usage, input.aliases.output);
  const cacheReadCount = readCount(usage, input.aliases.cacheRead);
  const cacheWriteCount = readCount(usage, input.aliases.cacheWrite);
  const reasoningCount = readCount(usage, input.aliases.reasoning);
  const totalCount = readCount(usage, input.aliases.total);
  const observed = [
    inputCount,
    outputCount,
    cacheReadCount,
    cacheWriteCount,
    reasoningCount,
    totalCount,
  ];

  if (!observed.some((count) => count.found)) {
    return undefined;
  }
  if (observed.some((count) => count.found && !isTokenCount(count.value))) {
    return undefined;
  }

  const counts: TokenUsageCounts = {
    inputTokens: inputCount.value,
    outputTokens: outputCount.value,
    cacheReadTokens: cacheReadCount.value,
    cacheWriteTokens: cacheWriteCount.value,
    reasoningTokens: reasoningCount.value,
    totalTokens: totalCount.found
      ? totalCount.value
      : inputCount.value + outputCount.value,
  };

  if (!Object.values(counts).every(isTokenCount)) {
    return undefined;
  }

  return {
    ...counts,
    measurementId: input.eventId,
    capturedAt: input.capturedAt,
    source: input.source,
    model: input.model,
    quality: 'measured',
    semantics: input.semantics,
  };
}

export function validateTokenUsageMeasurement(
  value: unknown
): TokenUsageMeasurement | undefined {
  if (!isPlainObject(value) || !hasValidCounts(value)) {
    return undefined;
  }
  if (!isBoundedString(value.measurementId)) {
    return undefined;
  }
  if (!Number.isSafeInteger(value.capturedAt) || (value.capturedAt as number) < 0) {
    return undefined;
  }
  if (typeof value.source !== 'string' || !AGENT_SOURCES.has(value.source)) {
    return undefined;
  }
  if (value.model !== undefined && !isBoundedString(value.model)) {
    return undefined;
  }
  if (value.quality !== 'measured' && value.quality !== 'estimated') {
    return undefined;
  }
  if (value.semantics !== 'delta' && value.semantics !== 'cumulative') {
    return undefined;
  }

  return {
    inputTokens: value.inputTokens as number,
    outputTokens: value.outputTokens as number,
    cacheReadTokens: value.cacheReadTokens as number,
    cacheWriteTokens: value.cacheWriteTokens as number,
    reasoningTokens: value.reasoningTokens as number,
    totalTokens: value.totalTokens as number,
    measurementId: value.measurementId,
    capturedAt: value.capturedAt as number,
    source: value.source as AgentSource,
    model: value.model as string | undefined,
    quality: value.quality,
    semantics: value.semantics,
  };
}

export function createEmptySessionTokenUsage(): SessionTokenUsage {
  return {
    ...ZERO_COUNTS,
    quality: 'unavailable',
    measurementCount: 0,
    rejectedMeasurementCount: 0,
    measuredEventCount: 0,
    estimatedEventCount: 0,
    cursors: {},
    measurementIds: [],
  };
}

function subtractCounts(
  current: TokenUsageCounts,
  previous: TokenUsageCounts
): TokenUsageCounts {
  if (current.totalTokens < previous.totalTokens) {
    return { ...current };
  }
  return {
    inputTokens: Math.max(0, current.inputTokens - previous.inputTokens),
    outputTokens: Math.max(0, current.outputTokens - previous.outputTokens),
    cacheReadTokens: Math.max(0, current.cacheReadTokens - previous.cacheReadTokens),
    cacheWriteTokens: Math.max(0, current.cacheWriteTokens - previous.cacheWriteTokens),
    reasoningTokens: Math.max(0, current.reasoningTokens - previous.reasoningTokens),
    totalTokens: current.totalTokens - previous.totalTokens,
  };
}

function addCounts(
  aggregate: SessionTokenUsage,
  delta: TokenUsageCounts
): TokenUsageCounts | undefined {
  const result: TokenUsageCounts = {
    inputTokens: aggregate.inputTokens + delta.inputTokens,
    outputTokens: aggregate.outputTokens + delta.outputTokens,
    cacheReadTokens: aggregate.cacheReadTokens + delta.cacheReadTokens,
    cacheWriteTokens: aggregate.cacheWriteTokens + delta.cacheWriteTokens,
    reasoningTokens: aggregate.reasoningTokens + delta.reasoningTokens,
    totalTokens: aggregate.totalTokens + delta.totalTokens,
  };
  return Object.values(result).every(isTokenCount) ? result : undefined;
}

function measurementCounts(measurement: TokenUsageMeasurement): TokenUsageCounts {
  return {
    inputTokens: measurement.inputTokens,
    outputTokens: measurement.outputTokens,
    cacheReadTokens: measurement.cacheReadTokens,
    cacheWriteTokens: measurement.cacheWriteTokens,
    reasoningTokens: measurement.reasoningTokens,
    totalTokens: measurement.totalTokens,
  };
}

function cumulativeCursorKey(measurement: TokenUsageMeasurement): string {
  if (measurement.source === 'codex') {
    return 'codex:session';
  }
  return `${measurement.source}:${measurement.model || 'unknown'}`;
}

export function mergeTokenUsage(
  current: SessionTokenUsage,
  measurement: TokenUsageMeasurement
): MergeTokenUsageResult {
  const valid = validateTokenUsageMeasurement(measurement);
  if (!valid) {
    return { aggregate: current, accepted: false, reason: 'invalid' };
  }
  if (current.measurementIds.includes(valid.measurementId)) {
    return { aggregate: current, accepted: false, reason: 'duplicate' };
  }

  const cursorKey = cumulativeCursorKey(valid);
  const previousCursor = current.cursors[cursorKey];
  if (
    valid.semantics === 'cumulative'
    && previousCursor
    && valid.capturedAt <= previousCursor.capturedAt
  ) {
    return { aggregate: current, accepted: false, reason: 'stale' };
  }

  const counts = measurementCounts(valid);
  const delta = valid.semantics === 'cumulative' && previousCursor
    ? subtractCounts(counts, previousCursor.counts)
    : counts;
  const totals = addCounts(current, delta);
  if (!totals) {
    return { aggregate: current, accepted: false, reason: 'invalid' };
  }

  const measurementIds = [...current.measurementIds, valid.measurementId]
    .slice(-MAX_MEASUREMENT_IDS);
  const cursors = valid.semantics === 'cumulative'
    ? {
        ...current.cursors,
        [cursorKey]: {
          capturedAt: valid.capturedAt,
          counts,
        },
      }
    : current.cursors;

  return {
    accepted: true,
    aggregate: {
      ...current,
      ...totals,
      quality: valid.quality,
      model: valid.model || current.model,
      measurementCount: current.measurementCount + 1,
      measuredEventCount: current.measuredEventCount + (valid.quality === 'measured' ? 1 : 0),
      estimatedEventCount: current.estimatedEventCount + (valid.quality === 'estimated' ? 1 : 0),
      cursors,
      measurementIds,
    },
  };
}

export function presentTokenUsage(usage: SessionTokenUsage): ClientTokenUsage {
  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheWriteTokens: usage.cacheWriteTokens,
    reasoningTokens: usage.reasoningTokens,
    totalTokens: usage.totalTokens,
    quality: usage.quality,
    model: usage.model,
    measurementCount: usage.measurementCount,
    rejectedMeasurementCount: usage.rejectedMeasurementCount,
  };
}
