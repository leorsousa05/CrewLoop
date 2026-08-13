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
const DEFAULT_MAX_DISCOVERY_ENTRIES = 4096;
const MAX_DISCOVERY_ENTRIES = 20_000;
const MAX_WIRE_MEASUREMENTS = 128;

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
  maxDiscoveryEntries?: number;
  wireIdentity?: string;
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

interface WireDiscoveryResult {
  paths: string[];
  partial: boolean;
}

function discoverWireJsonl(
  sessionId: string,
  dataDir: string,
  maxEntries: number
): WireDiscoveryResult {
  if (!/^[a-zA-Z0-9._-]{1,128}$/.test(sessionId)) {
    return { paths: [], partial: false };
  }

  const sessionSegments = new Set([
    sessionId,
    sessionId.startsWith('session_') ? sessionId : `session_${sessionId}`,
  ]);
  const paths: string[] = [];
  const pending = [dataDir];
  let inspected = 0;
  let partial = false;

  while (pending.length > 0 && inspected < maxEntries) {
    const directory = pending.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      partial = true;
      continue;
    }

    for (const entry of entries) {
      inspected += 1;
      if (inspected > maxEntries) {
        partial = true;
        break;
      }
      const candidate = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        pending.push(candidate);
        continue;
      }
      if (!entry.isFile() || entry.name !== 'wire.jsonl') {
        continue;
      }
      const relativeSegments = path.relative(dataDir, candidate).split(path.sep);
      if (relativeSegments.some((segment) => sessionSegments.has(segment))) {
        paths.push(candidate);
      }
    }
  }

  if (pending.length > 0) {
    partial = true;
  }
  return { paths: paths.sort(), partial };
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
    return { text, mtime: Math.floor(stats.mtimeMs) };
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

function measurementId(wireIdentity: string, timestamp: string, totalTokens: unknown): string {
  return stableUsageId('kimi:wire', wireIdentity, timestamp, totalTokens);
}

export function parseLatestKimiWireUsage(
  jsonlTail: string,
  fileMtime: number,
  input: Pick<
    ReadKimiSessionUsageInput,
    'sessionId' | 'model' | 'maxLineBytes' | 'wireIdentity'
  >
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
        eventId: measurementId(input.wireIdentity ?? 'standalone', String(capturedAt), totalTokens),
        capturedAt,
        semantics: 'cumulative',
        aliases: KIMI_WIRE_USAGE_ALIASES,
        cursorKey: `kimi:wire:${input.wireIdentity ?? 'standalone'}`,
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

export function readKimiSessionTokenUsage(
  input: ReadKimiSessionUsageInput
): TokenUsageMeasurement[] {
  if (!input.sessionId || input.sessionId === 'unknown') {
    return [];
  }

  const dataDir = resolveKimiDataDir(input.kimiDataDir);
  if (!dataDir) {
    return [];
  }

  try {
    const canonicalDataDir = fs.realpathSync(dataDir);
    const maxDiscoveryEntries = boundedPositiveInteger(
      input.maxDiscoveryEntries,
      DEFAULT_MAX_DISCOVERY_ENTRIES,
      MAX_DISCOVERY_ENTRIES
    );
    const discovery = discoverWireJsonl(input.sessionId, canonicalDataDir, maxDiscoveryEntries);
    if (discovery.paths.length === 0) {
      return [];
    }
    const maxTailBytes = boundedPositiveInteger(
      input.maxTailBytes,
      DEFAULT_MAX_TAIL_BYTES,
      MAX_TAIL_BYTES
    );
    const measurements: TokenUsageMeasurement[] = [];
    let partial = discovery.partial || discovery.paths.length > MAX_WIRE_MEASUREMENTS;

    for (const wirePath of discovery.paths.slice(0, MAX_WIRE_MEASUREMENTS)) {
      try {
        const canonicalWirePath = fs.realpathSync(wirePath);
        if (!isContainedPath(canonicalDataDir, canonicalWirePath)) {
          partial = true;
          continue;
        }
        const tail = readBoundedTail(canonicalWirePath, maxTailBytes);
        if (!tail) {
          partial = true;
          continue;
        }
        const relativePath = path.relative(canonicalDataDir, canonicalWirePath);
        const wireIdentity = stableUsageId('stream', relativePath);
        const measurement = parseLatestKimiWireUsage(tail.text, tail.mtime, {
          ...input,
          wireIdentity,
        });
        if (!measurement) {
          partial = true;
          continue;
        }
        measurements.push(measurement);
      } catch {
        partial = true;
      }
    }

    return measurements.map((measurement) => ({
      ...measurement,
      coverage: partial ? 'partial' : 'complete',
    }));
  } catch {
    return [];
  }
}
