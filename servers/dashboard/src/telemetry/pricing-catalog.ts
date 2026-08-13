export interface ModelPriceRate {
  models: readonly string[];
  effectiveFrom: string;
  effectiveTo?: string;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  cacheReadUsdPerMillion?: number;
  cacheWriteUsdPerMillion?: number;
  inputIncludesCache: boolean;
}

export interface PricingCatalog {
  version: string;
  rates: readonly ModelPriceRate[];
}

export const DEFAULT_PRICING_CATALOG: PricingCatalog = {
  version: '2026-08-10',
  rates: [
    rate(['gpt-5.6', 'gpt-5.6-sol'], '2026-08-10', 5, 30, 0.5, 6.25, true),
    rate(['gpt-5.6-terra'], '2026-08-10', 2.5, 15, 0.25, 3.125, true),
    rate(['gpt-5.6-luna'], '2026-08-10', 1, 6, 0.1, 1.25, true),
    rate(['claude-opus-5'], '2026-08-10', 5, 25, 0.5, 6.25, false),
    rate(['claude-fable-5', 'claude-mythos-5'], '2026-08-10', 10, 50, 1, 12.5, false),
    rate(['claude-haiku-4-5', 'claude-haiku-4.5'], '2026-08-10', 1, 5, 0.1, 1.25, false),
    rate(['claude-sonnet-5'], '2026-08-10', 2, 10, 0.2, 2.5, false, '2026-08-31'),
    rate(['claude-sonnet-5'], '2026-09-01', 3, 15, 0.3, 3.75, false),
  ],
};

function rate(
  models: readonly string[],
  effectiveFrom: string,
  inputUsdPerMillion: number,
  outputUsdPerMillion: number,
  cacheReadUsdPerMillion: number,
  cacheWriteUsdPerMillion: number,
  inputIncludesCache: boolean,
  effectiveTo?: string
): ModelPriceRate {
  return {
    models,
    effectiveFrom,
    effectiveTo,
    inputUsdPerMillion,
    outputUsdPerMillion,
    cacheReadUsdPerMillion,
    cacheWriteUsdPerMillion,
    inputIncludesCache,
  };
}

export function findModelPrice(
  catalog: PricingCatalog,
  model: string,
  localDate: string
): ModelPriceRate | undefined {
  const exactModel = model.trim().toLowerCase();
  return catalog.rates.find((candidate) =>
    candidate.models.some((alias) => alias.toLowerCase() === exactModel)
    && candidate.effectiveFrom <= localDate
    && (!candidate.effectiveTo || candidate.effectiveTo >= localDate)
  );
}
