import type { ProductPriceObservation } from '../../types/entities';
import { daysSince } from '../../utils/formatting/date';

export interface PriceIntelligenceSummary {
  productId: string;
  lowestPrice: { price: number; supermarketId: string; observedAt: string } | null;
  averagePrice: number | null;
  lastObserved: { price: number; supermarketId: string; observedAt: string } | null;
  priceDeltaVsPrevious: number | null; // positive = price went up
  observationCount: number;
}

/**
 * Summarizes a product's price history for the Price Intelligence screen.
 * Every figure here is derived strictly from past receipt observations —
 * nothing is presented as a live price.
 */
export function summarizePriceHistory(
  productId: string,
  observations: ProductPriceObservation[],
): PriceIntelligenceSummary {
  const forProduct = observations
    .filter((o) => o.productId === productId)
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());

  if (forProduct.length === 0) {
    return {
      productId,
      lowestPrice: null,
      averagePrice: null,
      lastObserved: null,
      priceDeltaVsPrevious: null,
      observationCount: 0,
    };
  }

  const lowest = forProduct.reduce((min, o) => (o.price < min.price ? o : min), forProduct[0]);
  const average = forProduct.reduce((sum, o) => sum + o.price, 0) / forProduct.length;
  const last = forProduct[forProduct.length - 1];
  const previous = forProduct.length > 1 ? forProduct[forProduct.length - 2] : null;

  return {
    productId,
    lowestPrice: { price: lowest.price, supermarketId: lowest.supermarketId, observedAt: lowest.observedAt },
    averagePrice: Math.round(average * 100) / 100,
    lastObserved: { price: last.price, supermarketId: last.supermarketId, observedAt: last.observedAt },
    priceDeltaVsPrevious: previous ? Math.round((last.price - previous.price) * 100) / 100 : null,
    observationCount: forProduct.length,
  };
}

export function isObservationStale(observedAt: string, staleDays = 30, now = new Date()): boolean {
  return daysSince(observedAt, now) > staleDays;
}

/** Best known price per supermarket for a product, most recent observation per store. */
export function compareAcrossSupermarkets(
  productId: string,
  observations: ProductPriceObservation[],
): { supermarketId: string; price: number; observedAt: string }[] {
  const latestBySupermarket = new Map<string, ProductPriceObservation>();
  for (const obs of observations.filter((o) => o.productId === productId)) {
    const existing = latestBySupermarket.get(obs.supermarketId);
    if (!existing || new Date(obs.observedAt) > new Date(existing.observedAt)) {
      latestBySupermarket.set(obs.supermarketId, obs);
    }
  }
  return Array.from(latestBySupermarket.values())
    .map((o) => ({ supermarketId: o.supermarketId, price: o.price, observedAt: o.observedAt }))
    .sort((a, b) => a.price - b.price);
}
