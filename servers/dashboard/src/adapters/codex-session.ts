import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { TokenUsageMeasurement } from '../types';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';
import { stableUsageId } from './usage-utils';

const DEFAULT_MAX_TAIL_BYTES = 256 * 1024;
const DEFAULT_MAX_LINE_BYTES = 64 * 1024;
const MAX_TAIL_BYTES = 1024 * 1024;
const MAX_LINE_BYTES = 256 * 1024;

const CODEX_SESSION_USAGE_ALIASES: TokenUsageAliases = {
  input: ['input_tokens'],
  output: ['output_tokens'],
  cacheRead: ['cached_input_tokens'],
  cacheWrite: [],
  reasoning: ['reasoning_output_tokens'],
  total: ['total_tokens'],
};

export interface ReadCodexSessionUsageInput {
  transcriptPath?: string;
  sessionId: string;
  model?: string;
  sessionsRoot?: string;
  maxTailBytes?: number;
  maxLineBytes?: number;
}

interface CodexTokenCountEvent {
  timestamp: string;
  type: 'event_msg';
  payload: {
    type: 'token_count';
    info: {
      total_token_usage: unknown;
    };
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTokenCountEvent(value: unknown): value is CodexTokenCountEvent {
  if (!isPlainObject(value) || value.type !== 'event_msg' || typeof value.timestamp !== 'string') {
    return false;
  }
  const payload = value.payload;
  if (!isPlainObject(payload) || payload.type !== 'token_count') {
    return false;
  }
  const info = payload.info;
  return isPlainObject(info) && Object.prototype.hasOwnProperty.call(info, 'total_token_usage');
}

function isContainedPath(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative.length > 0
    && !relative.startsWith(`..${path.sep}`)
    && relative !== '..'
    && !path.isAbsolute(relative);
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

function readBoundedTail(filePath: string, maxTailBytes: number): string | undefined {
  let descriptor: number | undefined;
  try {
    const size = fs.statSync(filePath).size;
    const bytesToRead = Math.min(size, maxTailBytes);
    const start = size - bytesToRead;
    const buffer = Buffer.alloc(bytesToRead);
    descriptor = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(descriptor, buffer, 0, bytesToRead, start);
    let text = buffer.subarray(0, bytesRead).toString('utf8');

    if (start > 0) {
      const firstNewline = text.indexOf('\n');
      text = firstNewline === -1 ? '' : text.slice(firstNewline + 1);
    }
    return text;
  } catch {
    return undefined;
  } finally {
    if (descriptor !== undefined) {
      try {
        fs.closeSync(descriptor);
      } catch {
        // The hook must remain fail-safe if the descriptor is already closed.
      }
    }
  }
}

function measurementId(timestamp: string, totalTokens: unknown): string {
  return stableUsageId('codex:token-count', timestamp, totalTokens);
}

export function parseLatestCodexTokenUsage(
  jsonlTail: string,
  input: Pick<ReadCodexSessionUsageInput, 'sessionId' | 'model' | 'maxLineBytes'>
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
      const value: unknown = JSON.parse(line);
      if (!isTokenCountEvent(value)) {
        continue;
      }

      const capturedAt = Date.parse(value.timestamp);
      if (!Number.isSafeInteger(capturedAt) || capturedAt < 0) {
        continue;
      }

      const usage = value.payload.info.total_token_usage;
      const totalTokens = isPlainObject(usage) ? usage.total_tokens : undefined;
      const normalized = normalizeTokenUsage({
        source: 'codex',
        rawUsage: usage,
        model: input.model,
        eventId: measurementId(value.timestamp, totalTokens),
        capturedAt,
        semantics: 'cumulative',
        aliases: CODEX_SESSION_USAGE_ALIASES,
        cursorKey: 'codex:session-transcript',
        coverage: 'complete',
      });
      if (normalized) {
        return normalized;
      }
    } catch {
      // Skip malformed or partially-written JSONL lines.
    }
  }

  return undefined;
}

export function readCodexSessionTokenUsage(
  input: ReadCodexSessionUsageInput
): TokenUsageMeasurement | undefined {
  if (!input.transcriptPath || path.extname(input.transcriptPath).toLowerCase() !== '.jsonl') {
    return undefined;
  }

  try {
    const configuredRoot = input.sessionsRoot || path.join(os.homedir(), '.codex', 'sessions');
    const canonicalRoot = fs.realpathSync(configuredRoot);
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
    return tail === undefined ? undefined : parseLatestCodexTokenUsage(tail, input);
  } catch {
    return undefined;
  }
}
