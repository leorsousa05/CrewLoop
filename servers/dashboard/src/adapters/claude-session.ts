import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { TokenUsageMeasurement } from '../types';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';
import { isPlainObject, parseCapturedAt, stableUsageId } from './usage-utils';

const DEFAULT_MAX_TAIL_BYTES = 512 * 1024;
const DEFAULT_MAX_LINE_BYTES = 128 * 1024;
const MAX_TAIL_BYTES = 1024 * 1024;
const MAX_LINE_BYTES = 256 * 1024;

const CLAUDE_USAGE_ALIASES: TokenUsageAliases = {
  input: ['input_tokens', 'inputTokens'],
  output: ['output_tokens', 'outputTokens'],
  cacheRead: ['cache_read_input_tokens', 'cacheReadInputTokens'],
  cacheWrite: ['cache_creation_input_tokens', 'cacheCreationInputTokens'],
  reasoning: ['reasoning_tokens', 'reasoningTokens'],
  total: ['total_tokens', 'totalTokens'],
};

export function normalizeClaudeUsageTotal(rawUsage: unknown): unknown {
  if (!isPlainObject(rawUsage)) return rawUsage;
  if (
    Object.prototype.hasOwnProperty.call(rawUsage, 'total_tokens')
    || Object.prototype.hasOwnProperty.call(rawUsage, 'totalTokens')
  ) {
    return rawUsage;
  }
  const values = [
    rawUsage.input_tokens ?? rawUsage.inputTokens,
    rawUsage.output_tokens ?? rawUsage.outputTokens,
    rawUsage.cache_read_input_tokens ?? rawUsage.cacheReadInputTokens,
    rawUsage.cache_creation_input_tokens ?? rawUsage.cacheCreationInputTokens,
  ];
  const numeric = values.filter((value): value is number => Number.isSafeInteger(value) && (value as number) >= 0);
  if (numeric.length === 0) return rawUsage;
  const totalTokens = numeric.reduce((sum, value) => sum + value, 0);
  if (!Number.isSafeInteger(totalTokens)) return rawUsage;
  return { ...rawUsage, totalTokens };
}

export interface ReadClaudeSessionUsageInput {
  transcriptPath?: string;
  sessionId: string;
  model?: string;
  projectsRoot?: string;
  maxTailBytes?: number;
  maxLineBytes?: number;
}

function boundedPositiveInteger(
  value: number | undefined,
  fallback: number,
  maximum: number
): number {
  return Number.isSafeInteger(value) && (value as number) > 0 && (value as number) <= maximum
    ? value as number
    : fallback;
}

function isContainedPath(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative.length > 0
    && !relative.startsWith(`..${path.sep}`)
    && relative !== '..'
    && !path.isAbsolute(relative);
}

function readBoundedTail(filePath: string, maxTailBytes: number): { text: string; mtime: number } | undefined {
  let descriptor: number | undefined;
  try {
    const stats = fs.statSync(filePath);
    const bytesToRead = Math.min(stats.size, maxTailBytes);
    const start = stats.size - bytesToRead;
    const buffer = Buffer.alloc(bytesToRead);
    descriptor = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(descriptor, buffer, 0, bytesToRead, start);
    let text = buffer.subarray(0, bytesRead).toString('utf8');
    if (start > 0) {
      const firstNewline = text.indexOf('\n');
      text = firstNewline === -1 ? '' : text.slice(firstNewline + 1);
    }
    return { text, mtime: Math.floor(stats.mtimeMs) };
  } catch {
    return undefined;
  } finally {
    if (descriptor !== undefined) {
      try {
        fs.closeSync(descriptor);
      } catch {
        // Closing an already-closed transcript must not block the source agent.
      }
    }
  }
}

export function parseLatestClaudeTokenUsage(
  jsonlTail: string,
  fileMtime: number,
  input: Pick<ReadClaudeSessionUsageInput, 'sessionId' | 'model' | 'maxLineBytes'>
): TokenUsageMeasurement | undefined {
  const maxLineBytes = boundedPositiveInteger(
    input.maxLineBytes,
    DEFAULT_MAX_LINE_BYTES,
    MAX_LINE_BYTES
  );
  const lines = jsonlTail.split(/\r?\n/);

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (!line || Buffer.byteLength(line, 'utf8') > maxLineBytes) {
      continue;
    }

    try {
      const record: unknown = JSON.parse(line);
      if (!isPlainObject(record) || record.type !== 'assistant' || !isPlainObject(record.message)) {
        continue;
      }
      const message = record.message;
      if (message.role !== undefined && message.role !== 'assistant') {
        continue;
      }
      if (typeof message.id !== 'string' || message.id.length === 0 || message.id.length > 512) {
        continue;
      }
      const usage = isPlainObject(message.usage) ? message.usage : undefined;
      const capturedAt = parseCapturedAt(record.timestamp)
        ?? parseCapturedAt(message.timestamp)
        ?? fileMtime;
      const model = input.model ?? (typeof message.model === 'string' ? message.model : undefined);
      const normalized = normalizeTokenUsage({
        source: 'claude',
        rawUsage: normalizeClaudeUsageTotal(usage),
        model,
        eventId: stableUsageId('claude:message', message.id),
        capturedAt,
        semantics: 'delta',
        aliases: CLAUDE_USAGE_ALIASES,
        cursorKey: 'claude:assistant-message',
        coverage: 'complete',
      });
      if (normalized) {
        return normalized;
      }
    } catch {
      // Malformed and partially-written transcript lines are skipped without exposure.
    }
  }

  return undefined;
}

export function readClaudeSessionTokenUsage(
  input: ReadClaudeSessionUsageInput
): TokenUsageMeasurement | undefined {
  if (
    !input.sessionId
    || input.sessionId === 'unknown'
    || !input.transcriptPath
    || path.extname(input.transcriptPath).toLowerCase() !== '.jsonl'
  ) {
    return undefined;
  }

  try {
    const projectsRoot = input.projectsRoot ?? path.join(os.homedir(), '.claude', 'projects');
    const canonicalRoot = fs.realpathSync(projectsRoot);
    const canonicalTranscript = fs.realpathSync(input.transcriptPath);
    if (!isContainedPath(canonicalRoot, canonicalTranscript)) {
      return undefined;
    }
    const maxTailBytes = boundedPositiveInteger(
      input.maxTailBytes,
      DEFAULT_MAX_TAIL_BYTES,
      MAX_TAIL_BYTES
    );
    const tail = readBoundedTail(canonicalTranscript, maxTailBytes);
    return tail
      ? parseLatestClaudeTokenUsage(tail.text, tail.mtime, input)
      : undefined;
  } catch {
    return undefined;
  }
}
