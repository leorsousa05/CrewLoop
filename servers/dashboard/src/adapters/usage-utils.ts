import { createHash } from 'node:crypto';

const MAX_IDENTITY_PART_LENGTH = 512;

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSafeTokenCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function parseCapturedAt(value: unknown): number | undefined {
  if (Number.isSafeInteger(value) && (value as number) >= 0) {
    return value as number;
  }
  if (typeof value !== 'string' || value.length === 0 || value.length > 100) {
    return undefined;
  }
  const parsed = Date.parse(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

export function stableUsageId(prefix: string, ...parts: unknown[]): string {
  const digest = createHash('sha256');
  for (const part of parts) {
    const normalized = typeof part === 'string'
      ? part.slice(0, MAX_IDENTITY_PART_LENGTH)
      : JSON.stringify(part);
    digest.update(normalized ?? 'undefined');
    digest.update('\0');
  }
  return `${prefix}:${digest.digest('hex').slice(0, 32)}`;
}

export function usdToMicrousd(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  const microusd = Math.round(value * 1_000_000);
  return Number.isSafeInteger(microusd) ? microusd : undefined;
}
