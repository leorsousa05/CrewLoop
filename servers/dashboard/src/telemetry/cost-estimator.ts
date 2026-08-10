import type { TokenUsageCounts } from '../types';
import {
  DEFAULT_PRICING_CATALOG,
  findModelPrice,
  type PricingCatalog,
} from './pricing-catalog';

export type MeasurementCostQuality = 'reported' | 'estimated' | 'unavailable';

export interface CostEstimate {
  costMicrousd: number | null;
  quality: MeasurementCostQuality;
  pricingVersion: string | null;
  pricedTokens: number;
}

export interface EstimateCostInput {
  counts: TokenUsageCounts;
  localDate: string;
  model?: string;
  reportedCostMicrousd?: number;
}

export class CostEstimator {
  constructor(private readonly catalog: PricingCatalog = DEFAULT_PRICING_CATALOG) {}

  estimate(input: EstimateCostInput): CostEstimate {
    if (
      input.reportedCostMicrousd !== undefined
      && Number.isSafeInteger(input.reportedCostMicrousd)
      && input.reportedCostMicrousd >= 0
    ) {
      return {
        costMicrousd: input.reportedCostMicrousd,
        quality: 'reported',
        pricingVersion: null,
        pricedTokens: input.counts.totalTokens,
      };
    }

    if (!input.model) return unavailableCost();
    const price = findModelPrice(this.catalog, input.model, input.localDate);
    if (!price) return unavailableCost();

    const uncachedInput = price.inputIncludesCache
      ? Math.max(
          0,
          input.counts.inputTokens
            - input.counts.cacheReadTokens
            - input.counts.cacheWriteTokens
        )
      : input.counts.inputTokens;
    const microUsd =
      uncachedInput * price.inputUsdPerMillion
      + input.counts.outputTokens * price.outputUsdPerMillion
      + input.counts.cacheReadTokens * (price.cacheReadUsdPerMillion ?? price.inputUsdPerMillion)
      + input.counts.cacheWriteTokens * (price.cacheWriteUsdPerMillion ?? price.inputUsdPerMillion);

    const rounded = Math.round(microUsd);
    if (!Number.isSafeInteger(rounded) || rounded < 0) return unavailableCost();
    return {
      costMicrousd: rounded,
      quality: 'estimated',
      pricingVersion: this.catalog.version,
      pricedTokens: input.counts.totalTokens,
    };
  }
}

function unavailableCost(): CostEstimate {
  return {
    costMicrousd: null,
    quality: 'unavailable',
    pricingVersion: null,
    pricedTokens: 0,
  };
}
