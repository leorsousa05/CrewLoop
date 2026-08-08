import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { TokenUsageMeasurement } from '../types';
import { normalizeTokenUsage, type TokenUsageAliases } from '../telemetry/token-usage';

const DEFAULT_MAX_TAIL_BYTES = 256 * 1024;
const DEFAULT_MAX_LINE_BYTES = 64 * 1024;
const MAX_TAIL_BYTES = 1024 * 1024;
const MAX_LINE_BYTES = 256 * 1024;

const KIMI_WIRE_USAGE_ALIASES: TokenUsageAliases = {
  input: ['inputOther', 'input_other'],
  output: ['output', 'output_tokens'],
  cacheRead: ['inputCacheRead', 'input_cache_read', 'cached_tokens'],
  cacheWrite: ['inputCacheCreation', 'input_cache_creation'],
  reasoning: ['reasoning_tokens'],
  total: ['total', 'total_tokens'],
};

export interface ReadKimiSessionUsageInput {
  sessionId: string;
  model?: string;
  kimiDataDir?: string;
  maxTailBytes?: number;
  maxLineBytes?: number;
}

interface KimiWireUsageRecord {
  type: 'usage.record';
  timestamp?: string;
  time?: number;
  usage?: Record<string, unknown>;
  token_usage?: Record<string, unknown>;
  model?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUsageRecord(value: unknown): value is KimiWireUsageRecord {
  return isPlainObject(value) && value.type === 'usage.record';
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

function resolveKimiDataDir(input?: string): string | undefined {
  if (input) {
    return input.split(',')[0].trim();
  }
  const env = process.env.KIMI_DATA_DIR;
  if (env) {
    return env.split(',')[0].trim();
  }
  const home = os.homedir();
  const primary = path.join(home, '.kimi-code');
  if (fs.existsSync(primary)) {
    return primary;
  }
  const legacy = path.join(home, '.kimi');
  return fs.existsSync(legacy) ? legacy : undefined;
}

const pathCache = new Map<string, string | undefined>();

function discoverWireJsonl(sessionId: string, dataDir: string): string | undefined {
  const cacheKey = `${dataDir}:${sessionId}`;
  if (pathCache.has(cacheKey)) {
    return pathCache.get(cacheKey);
  }

  try {
    const canonicalDataDir = fs.realpathSync(dataDir);
    const entries = fs.readdirSync(canonicalDataDir, { recursive: true }) as string[];

    const sessionMatches = entries
      .filter((relative) => path.basename(relative) === 'wire.jsonl')
      .map((relative) => path.join(canonicalDataDir, relative))
      .filter((absolute) => {
        const normalized = path.normalize(absolute);
        const withPrefix = sessionId.startsWith('session_')
          ? sessionId
          : `session_${sessionId}`;
        return normalized.includes(`${path.sep}${sessionId}${path.sep}`)
          || normalized.includes(`${path.sep}${withPrefix}${path.sep}`);
      });

    if (sessionMatches.length === 0) {
      pathCache.set(cacheKey, undefined);
      return undefined;
    }

    let newest = sessionMatches[0];
    let newestMtime = 0;
    for (const candidate of sessionMatches) {
      try {
        const stats = fs.statSync(candidate);
        if (stats.mtimeMs > newestMtime) {
          newestMtime = stats.mtimeMs;
          newest = candidate;
        }
      } catch {
        // Skip files we cannot stat.
      }
    }

    pathCache.set(cacheKey, newest);
    return newest;
  } catch {
    pathCache.set(cacheKey, undefined);
    return undefined;
  }
}

function readBoundedTail(filePath: string, maxTailBytes: number): { text: string; mtime: number } | undefined {
  let descriptor: number | undefined;
  try {
    const stats = fs.statSync(filePath);
    const size = stats.size;
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
    return { text, mtime: stats.mtimeMs };
  } catch {
    return undefined;
  } finally {
    if (descriptor !== undefined) {
      try {
        fs.closeSync(descriptor);
      } catch {
        // The adapter must remain fail-safe if the descriptor is already closed.
      }
    }
  }
}

function measurementId(sessionId: string, timestamp: string, totalTokens: unknown): string {
  const boundedSessionId = sessionId.slice(0, 64);
  return `kimi:${boundedSessionId}:wire:${timestamp}:${String(totalTokens)}`.slice(0, 200);
}

export function parseLatestKimiWireUsage(
  jsonlTail: string,
  fileMtime: number,
  input: Pick<ReadKimiSessionUsageInput, 'sessionId' | 'model' | 'maxLineBytes'>
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
      if (!isUsageRecord(value)) {
        continue;
      }

      const rawTimestamp = typeof value.timestamp === 'string' ? value.timestamp : undefined;
      const rawTime = Number.isSafeInteger(value.time) && (value.time as number) >= 0
        ? (value.time as number)
        : undefined;
      const capturedAt = rawTimestamp
        ? Date.parse(rawTimestamp)
        : rawTime ?? fileMtime;
      if (!Number.isSafeInteger(capturedAt) || capturedAt < 0) {
        continue;
      }

      const usage = isPlainObject(value.usage)
        ? value.usage
        : isPlainObject(value.token_usage)
          ? value.token_usage
          : undefined;
      const totalTokens = isPlainObject(usage) ? usage.total : undefined;
      const model = input.model ?? (typeof value.model === 'string' ? value.model : undefined);
      const normalized = normalizeTokenUsage({
        source: 'kimi',
        rawUsage: usage,
        model,
        eventId: measurementId(input.sessionId, String(capturedAt), totalTokens),
        capturedAt,
        semantics: 'cumulative',
        aliases: KIMI_WIRE_USAGE_ALIASES,
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

export function readKimiSessionTokenUsage(
  input: ReadKimiSessionUsageInput
): TokenUsageMeasurement | undefined {
  if (!input.sessionId || input.sessionId === 'unknown') {
    return undefined;
  }

  const dataDir = resolveKimiDataDir(input.kimiDataDir);
  if (!dataDir) {
    return undefined;
  }

  try {
    const canonicalDataDir = fs.realpathSync(dataDir);
    const wirePath = discoverWireJsonl(input.sessionId, canonicalDataDir);
    if (!wirePath) {
      return undefined;
    }

    const canonicalWirePath = fs.realpathSync(wirePath);
    if (!isContainedPath(canonicalDataDir, canonicalWirePath)) {
      return undefined;
    }

    const maxTailBytes = boundedPositiveInteger(
      input.maxTailBytes,
      DEFAULT_MAX_TAIL_BYTES,
      MAX_TAIL_BYTES
    );
    const tail = readBoundedTail(canonicalWirePath, maxTailBytes);
    return tail === undefined
      ? undefined
      : parseLatestKimiWireUsage(tail.text, tail.mtime, input);
  } catch {
    return undefined;
  }
}
