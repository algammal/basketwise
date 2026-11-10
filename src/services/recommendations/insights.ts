import type { ProductPriceObservation, HouseholdBudget } from '../../types/entities';
import { summarizePriceHistory } from '../pricing/priceIntelligence';
import { getBudgetUtilization, NEAR_LIMIT_THRESHOLD, type BudgetSnapshot } from '../../utils/finance/budget';

export type InsightKind = 'price-increase' | 'price-decrease' | 'savings-opportunity' | 'budget-alert';

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string;
  /** Distinguishes a calculated fact (from receipt history) from a derived estimate. */
  basis: 'calculated' | 'estimated';
}

/** Flags products whose last observed price moved vs. the one before it. */
export function getPriceMovementInsights(
  productIds: string[],
  observations: ProductPriceObservation[],
  productNameOf: (id: string) => string,
): Insight[] {
  const insights: Insight[] = [];

  for (const productId of productIds) {
    const summary = summarizePriceHistory(productId, observations);
    if (summary.priceDeltaVsPrevious === null || summary.priceDeltaVsPrevious === 0) continue;

    const name = productNameOf(productId);
    const increased = summary.priceDeltaVsPrevious > 0;
    insights.push({
      id: `price-${productId}`,
      kind: increased ? 'price-increase' : 'price-decrease',
      title: increased ? `${name} got more expensive` : `${name} got cheaper`,
      detail: `${increased ? 'Up' : 'Down'} by ${Math.abs(summary.priceDeltaVsPrevious).toFixed(2)} since the last purchase.`,
      basis: 'calculated',
    });
  }

  return insights;
}

export function getBudgetAlertInsight(snapshot: BudgetSnapshot): Insight | null {
  const utilization = getBudgetUtilization(snapshot);
  if (utilization < NEAR_LIMIT_THRESHOLD * 100) return null;

  const overBudget = utilization >= 100;
  return {
    id: 'budget-alert',
    kind: 'budget-alert',
    title: overBudget ? 'Over budget this month' : 'Approaching your budget limit',
    detail: `Projected spending is at ${utilization.toFixed(0)}% of your monthly budget.`,
    basis: 'calculated',
  };
}
