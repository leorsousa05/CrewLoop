import type {
  ClientTokenUsage,
  CodingAgentProduct,
  TokenUsageCounts,
  TokenUsageMeasurement,
} from '../types';

export const CODING_AGENT_PRODUCTS: readonly CodingAgentProduct[] = [
  'codex',
  'kimi',
  'claude',
  'opencode',
  'agy',
];

export type UsageAvailability = 'measured' | 'partial' | 'unavailable';
export type CostQuality = 'reported' | 'estimated' | 'mixed' | 'unavailable';
export type UsageWriteStatus = 'accepted' | 'duplicate' | 'stale' | 'invalid' | 'reset-filtered';

export interface PersistUsageInput {
  product: CodingAgentProduct;
  sessionId: string;
  cursorKey: string;
  measurement: TokenUsageMeasurement;
  reportedCostMicrousd?: number;
}

export interface PersistUsageResult {
  status: UsageWriteStatus;
  delta?: TokenUsageCounts;
  sessionUsage?: ClientTokenUsage;
  localDate?: string;
}

export interface ProductUsageRow {
  product: CodingAgentProduct;
  date: string | null;
  tokenUsage: TokenUsageCounts | null;
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

export interface TokenUsageRepository {
  readonly timeZone: string;
  record(input: PersistUsageInput): PersistUsageResult;
  getSessionUsage(
    product: CodingAgentProduct,
    sessionId: string
  ): ClientTokenUsage | undefined;
  queryDaily(query: { from: string; to: string }): UsageComparisonResponse;
  getOldestUsageDate(): string | undefined;
  reset(
    products?: CodingAgentProduct[],
    at?: number
  ): { deletedMeasurements: number };
  close(): void;
}
