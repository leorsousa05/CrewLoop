import type { UsageRange } from './types';

export const CODING_AGENT_PRODUCTS = ['codex', 'kimi', 'claude', 'opencode', 'agy'] as const;

export type CodingAgentProduct = (typeof CODING_AGENT_PRODUCTS)[number];
export type UsageAvailability = 'measured' | 'partial' | 'unavailable';
export type CostQuality = 'reported' | 'estimated' | 'mixed' | 'unavailable';

export interface UsageTokenCounts {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface ProductUsageRow {
  product: CodingAgentProduct;
  date: string | null;
  tokenUsage: UsageTokenCounts | null;
  availability: UsageAvailability;
  measurementCount: number;
  estimatedCostUsd: number | null;
  costQuality: CostQuality;
  pricedTokens: number;
  totalTokens: number | null;
  lastMeasurementAt: number | null;
}

export interface UsageComparisonResponse {
  generatedAt: number;
  range: { from: string; to: string; timeZone: string };
  products: ProductUsageRow[];
  daily: ProductUsageRow[];
}

export interface UsageSummary {
  totalTokens: number;
  reportingProducts: number;
  estimatedCostUsd: number | null;
  costQuality: CostQuality;
  pricedTokens: number;
  costCoverage: number;
}

export interface UsageViewModel {
  response: UsageComparisonResponse;
  products: ProductUsageRow[];
  daily: ProductUsageRow[];
  summary: UsageSummary;
  unavailableProducts: CodingAgentProduct[];
  isEmpty: boolean;
}

const PRODUCT_SET: ReadonlySet<string> = new Set(CODING_AGENT_PRODUCTS);
const AVAILABILITY_SET: ReadonlySet<string> = new Set(['measured', 'partial', 'unavailable']);
const COST_QUALITY_SET: ReadonlySet<string> = new Set(['reported', 'estimated', 'mixed', 'unavailable']);
const PRODUCT_ORDER = new Map(CODING_AGENT_PRODUCTS.map((product, index) => [product, index]));

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function parseCounts(value: unknown): UsageTokenCounts | null | undefined {
  if (value === null) return null;
  if (!isObject(value)) return undefined;
  const keys: Array<keyof UsageTokenCounts> = [
    'inputTokens',
    'outputTokens',
    'cacheReadTokens',
    'cacheWriteTokens',
    'reasoningTokens',
    'totalTokens',
  ];
  if (!keys.every((key) => isSafeCount(value[key]))) return undefined;
  return Object.fromEntries(keys.map((key) => [key, value[key]])) as unknown as UsageTokenCounts;
}

function parseRow(value: unknown): ProductUsageRow | undefined {
  if (!isObject(value) || typeof value.product !== 'string' || !PRODUCT_SET.has(value.product)) {
    return undefined;
  }
  const tokenUsage = parseCounts(value.tokenUsage);
  if (tokenUsage === undefined) return undefined;
  if (value.date !== null && (typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date))) {
    return undefined;
  }
  if (typeof value.availability !== 'string' || !AVAILABILITY_SET.has(value.availability)) return undefined;
  if (!isSafeCount(value.measurementCount) || !isSafeCount(value.pricedTokens)) return undefined;
  if (value.estimatedCostUsd !== null && (typeof value.estimatedCostUsd !== 'number' || !Number.isFinite(value.estimatedCostUsd) || value.estimatedCostUsd < 0)) {
    return undefined;
  }
  if (typeof value.costQuality !== 'string' || !COST_QUALITY_SET.has(value.costQuality)) return undefined;
  if (value.totalTokens !== null && !isSafeCount(value.totalTokens)) return undefined;
  if (value.lastMeasurementAt !== null && !isSafeCount(value.lastMeasurementAt)) return undefined;

  return {
    product: value.product as CodingAgentProduct,
    date: value.date as string | null,
    tokenUsage,
    availability: value.availability as UsageAvailability,
    measurementCount: value.measurementCount,
    estimatedCostUsd: value.estimatedCostUsd as number | null,
    costQuality: value.costQuality as CostQuality,
    pricedTokens: value.pricedTokens,
    totalTokens: value.totalTokens as number | null,
    lastMeasurementAt: value.lastMeasurementAt as number | null,
  };
}

export function parseUsageComparisonResponse(value: unknown): UsageComparisonResponse | undefined {
  if (!isObject(value) || !isSafeCount(value.generatedAt) || !isObject(value.range)) return undefined;
  const { from, to, timeZone } = value.range;
  if (
    typeof from !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
    typeof to !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
    typeof timeZone !== 'string' || timeZone.length === 0 || timeZone.length > 100 ||
    !Array.isArray(value.products) || !Array.isArray(value.daily)
  ) {
    return undefined;
  }
  const products = value.products.map(parseRow);
  const daily = value.daily.map(parseRow);
  if (products.some((row) => !row) || daily.some((row) => !row)) return undefined;
  if (daily.some((row) => row?.date === null) || products.some((row) => row?.date !== null)) return undefined;

  return {
    generatedAt: value.generatedAt,
    range: { from, to, timeZone },
    products: products as ProductUsageRow[],
    daily: daily as ProductUsageRow[],
  };
}

function unavailableRow(product: CodingAgentProduct): ProductUsageRow {
  return {
    product,
    date: null,
    tokenUsage: null,
    availability: 'unavailable',
    measurementCount: 0,
    estimatedCostUsd: null,
    costQuality: 'unavailable',
    pricedTokens: 0,
    totalTokens: null,
    lastMeasurementAt: null,
  };
}

export function buildUsageViewModel(response: UsageComparisonResponse): UsageViewModel {
  const byProduct = new Map(response.products.map((row) => [row.product, row]));
  const allProducts = CODING_AGENT_PRODUCTS.map((product) => byProduct.get(product) ?? unavailableRow(product));
  const measured = allProducts
    .filter((row) => row.tokenUsage !== null)
    .sort((a, b) => (b.totalTokens ?? 0) - (a.totalTokens ?? 0) || (PRODUCT_ORDER.get(a.product) ?? 0) - (PRODUCT_ORDER.get(b.product) ?? 0));
  const unavailable = allProducts.filter((row) => row.tokenUsage === null);
  const products = [...measured, ...unavailable];
  const totalTokens = measured.reduce((sum, row) => sum + (row.totalTokens ?? row.tokenUsage?.totalTokens ?? 0), 0);
  const pricedTokens = measured.reduce((sum, row) => sum + row.pricedTokens, 0);
  const costs = measured.filter((row) => row.estimatedCostUsd !== null);
  const estimatedCostUsd = costs.length === 0
    ? null
    : costs.reduce((sum, row) => sum + (row.estimatedCostUsd ?? 0), 0);
  const qualities = new Set(costs.map((row) => row.costQuality));
  const costCoverage = totalTokens === 0 ? (costs.length > 0 ? 1 : 0) : Math.min(1, pricedTokens / totalTokens);
  const costQuality: CostQuality = estimatedCostUsd === null
    ? 'unavailable'
    : costCoverage < 1 || qualities.has('mixed') || qualities.size > 1
      ? 'mixed'
      : qualities.has('reported')
        ? 'reported'
        : 'estimated';

  return {
    response,
    products,
    daily: [...response.daily].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || (PRODUCT_ORDER.get(a.product) ?? 0) - (PRODUCT_ORDER.get(b.product) ?? 0)),
    summary: {
      totalTokens,
      reportingProducts: measured.length,
      estimatedCostUsd,
      costQuality,
      pricedTokens,
      costCoverage,
    },
    unavailableProducts: unavailable.map((row) => row.product),
    isEmpty: measured.length === 0,
  };
}

function dateInTimeZone(timestamp: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp));
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${read('year')}-${read('month')}-${read('day')}`;
}

function subtractCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day));
  cursor.setUTCDate(cursor.getUTCDate() - days);
  return cursor.toISOString().slice(0, 10);
}

export function buildDailyUsageUrl(
  range: UsageRange,
  options: { timeZone?: string; now?: number } = {}
): string {
  if (range === '30d' && !options.timeZone) return '/api/usage/daily';
  if (range === 'all') return '/api/usage/daily?range=all';
  const timeZone = options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const to = dateInTimeZone(options.now ?? Date.now(), timeZone);
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const from = subtractCalendarDays(to, days - 1);
  return `/api/usage/daily?from=${from}&to=${to}`;
}

export function formatProduct(product: CodingAgentProduct): string {
  if (product === 'opencode') return 'OpenCode';
  if (product === 'agy') return 'AGY';
  return product.charAt(0).toUpperCase() + product.slice(1);
}

export function formatExactTokens(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatCompactTokens(value: number): string {
  if (value >= 1_000_000_000) return `${trim(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${trim(value / 1_000_000)}M`;
  if (value >= 1_000) return `${trim(value / 1_000)}K`;
  return String(value);
}

function trim(value: number): string {
  return value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2).replace(/\.0+$|(?<=\.[0-9])0+$/, '');
}

export function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: value < 1 ? 4 : 2, maximumFractionDigits: value < 1 ? 4 : 2 });
}
