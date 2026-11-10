import type { ProductPriceObservation, ShoppingPlanItem, OptimizationStrategy } from '../../types/entities';

/**
 * Household purchase optimization. Pure functions operating on plain data —
 * no UI, no Redux — so the three strategies from the product spec can be
 * unit tested directly.
 *
 * Strategy A — Single Supermarket: cheapest total if everything (that is
 * available) is bought from one store.
 * Strategy B — Maximum Savings: every item goes to whichever store has its
 * lowest known price, regardless of how many stores that requires.
 * Strategy C — Personalized: must-buy / favorite items are never dropped or
 * reassigned away from their preferred store for price reasons; remaining
 * items are optimized for savings same as Strategy B.
 *
 * Nothing here invents a price. An item with no observation anywhere is
 * reported as missing, not defaulted to zero or an average.
 */

export const STALE_PRICE_DAYS = 30;

export interface PriceIndexEntry {
  price: number;
  observedAt: string;
  isStale: boolean;
}

/** productId -> supermarketId -> latest observation */
export type PriceIndex = Map<string, Map<string, PriceIndexEntry>>;

export function buildPriceIndex(
  observations: ProductPriceObservation[],
  now: Date = new Date(),
): PriceIndex {
  const index: PriceIndex = new Map();

  for (const obs of observations) {
    if (!index.has(obs.productId)) {
      index.set(obs.productId, new Map());
    }
    const bySupermarket = index.get(obs.productId)!;
    const existing = bySupermarket.get(obs.supermarketId);
    if (!existing || new Date(obs.observedAt) > new Date(existing.observedAt)) {
      const ageDays = (now.getTime() - new Date(obs.observedAt).getTime()) / (1000 * 60 * 60 * 24);
      bySupermarket.set(obs.supermarketId, {
        price: obs.price,
        observedAt: obs.observedAt,
        isStale: ageDays > STALE_PRICE_DAYS,
      });
    }
  }

  return index;
}

export interface SupermarketAllocationLine {
  planItemId: string;
  productId: string;
  supermarketId: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  isStale: boolean;
}

export interface OptimizationResult {
  strategy: OptimizationStrategy;
  totalEstimatedCost: number;
  allocations: SupermarketAllocationLine[];
  supermarketIds: string[];
  missingPriceProductIds: string[];
  stalePriceProductIds: string[];
  potentialSavings: number;
}

function getCheapestSupermarket(
  productId: string,
  priceIndex: PriceIndex,
  restrictToSupermarketId?: string,
): { supermarketId: string; entry: PriceIndexEntry } | null {
  const bySupermarket = priceIndex.get(productId);
  if (!bySupermarket) return null;

  let best: { supermarketId: string; entry: PriceIndexEntry } | null = null;
  for (const [supermarketId, entry] of bySupermarket) {
    if (restrictToSupermarketId && supermarketId !== restrictToSupermarketId) continue;
    if (!best || entry.price < best.entry.price) {
      best = { supermarketId, entry };
    }
  }
  return best;
}

function priceableItems(items: ShoppingPlanItem[]): ShoppingPlanItem[] {
  return items.filter((item) => item.productId);
}

/** Strategy A: total cost if every available item is bought from a single store, for each candidate store. */
export function computeSingleSupermarketStrategy(
  items: ShoppingPlanItem[],
  priceIndex: PriceIndex,
  supermarketIds: string[],
): OptimizationResult[] {
  const results: OptimizationResult[] = [];
  const candidates = priceableItems(items);

  for (const supermarketId of supermarketIds) {
    const allocations: SupermarketAllocationLine[] = [];
    const missingPriceProductIds: string[] = [];
    const stalePriceProductIds: string[] = [];

    for (const item of candidates) {
      const entry = priceIndex.get(item.productId!)?.get(supermarketId);
      if (!entry) {
        missingPriceProductIds.push(item.productId!);
        continue;
      }
      if (entry.isStale) stalePriceProductIds.push(item.productId!);
      allocations.push({
        planItemId: item.id,
        productId: item.productId!,
        supermarketId,
        unitPrice: entry.price,
        quantity: item.quantity,
        lineTotal: entry.price * item.quantity,
        isStale: entry.isStale,
      });
    }

    const totalEstimatedCost = allocations.reduce((sum, a) => sum + a.lineTotal, 0);
    results.push({
      strategy: 'single-supermarket',
      totalEstimatedCost,
      allocations,
      supermarketIds: [supermarketId],
      missingPriceProductIds,
      stalePriceProductIds,
      potentialSavings: 0,
    });
  }

  return results;
}

/** Strategy B: every item allocated to whichever store has its lowest known price. */
export function computeMaximumSavingsStrategy(
  items: ShoppingPlanItem[],
  priceIndex: PriceIndex,
): OptimizationResult {
  return allocateCheapestPerItem(items, priceIndex, 'maximum-savings');
}

/**
 * Strategy C: must-buy/favorite items keep their recommended supermarket
 * (or the cheapest if none is set) regardless of price elsewhere; remaining
 * items are allocated for maximum savings like Strategy B.
 */
export function computePersonalizedStrategy(
  items: ShoppingPlanItem[],
  priceIndex: PriceIndex,
): OptimizationResult {
  return allocateCheapestPerItem(items, priceIndex, 'personalized', (item) =>
    item.isMustBuy || item.isFavorite ? item.recommendedSupermarketId : undefined,
  );
}

function allocateCheapestPerItem(
  items: ShoppingPlanItem[],
  priceIndex: PriceIndex,
  strategy: OptimizationStrategy,
  restrictFor?: (item: ShoppingPlanItem) => string | undefined,
): OptimizationResult {
  const allocations: SupermarketAllocationLine[] = [];
  const missingPriceProductIds: string[] = [];
  const stalePriceProductIds: string[] = [];
  const supermarketIds = new Set<string>();

  for (const item of priceableItems(items)) {
    const restriction = restrictFor?.(item);
    const best = getCheapestSupermarket(item.productId!, priceIndex, restriction);
    if (!best) {
      missingPriceProductIds.push(item.productId!);
      continue;
    }
    if (best.entry.isStale) stalePriceProductIds.push(item.productId!);
    supermarketIds.add(best.supermarketId);
    allocations.push({
      planItemId: item.id,
      productId: item.productId!,
      supermarketId: best.supermarketId,
      unitPrice: best.entry.price,
      quantity: item.quantity,
      lineTotal: best.entry.price * item.quantity,
      isStale: best.entry.isStale,
    });
  }

  const totalEstimatedCost = allocations.reduce((sum, a) => sum + a.lineTotal, 0);

  return {
    strategy,
    totalEstimatedCost,
    allocations,
    supermarketIds: Array.from(supermarketIds),
    missingPriceProductIds,
    stalePriceProductIds,
    potentialSavings: 0,
  };
}

/** Picks the cheapest Strategy A candidate and computes savings vs. Strategy B. */
export function compareStrategies(
  singleSupermarketResults: OptimizationResult[],
  maximumSavings: OptimizationResult,
): { recommended: OptimizationResult; potentialSavings: number } {
  const cheapestSingle = singleSupermarketResults
    .filter((r) => r.allocations.length > 0)
    .reduce<OptimizationResult | null>(
      (best, r) => (!best || r.totalEstimatedCost < best.totalEstimatedCost ? r : best),
      null,
    );

  if (!cheapestSingle) {
    return { recommended: maximumSavings, potentialSavings: 0 };
  }

  const potentialSavings = Math.max(0, cheapestSingle.totalEstimatedCost - maximumSavings.totalEstimatedCost);
  const recommended = potentialSavings > 0 ? maximumSavings : cheapestSingle;
  return { recommended: { ...recommended, potentialSavings }, potentialSavings };
}
