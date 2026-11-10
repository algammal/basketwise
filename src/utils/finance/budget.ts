/**
 * Core household budget formulas. Pure functions — no UI, no Redux, no I/O —
 * so they can be unit tested in isolation and reused from selectors.
 *
 * Planned purchases are never counted as actual expenditure; conflating the
 * two was explicitly called out as a defect to avoid.
 */

export interface BudgetSnapshot {
  monthlyBudget: number;
  actualSpending: number;
  plannedSpending: number;
}

export type BudgetStatus = 'within-budget' | 'near-limit' | 'over-budget';

export const NEAR_LIMIT_THRESHOLD = 0.9; // 90% utilization

export function getAvailableBudget(snapshot: BudgetSnapshot): number {
  return snapshot.monthlyBudget - snapshot.actualSpending;
}

export function getProjectedSpending(snapshot: BudgetSnapshot): number {
  return snapshot.actualSpending + snapshot.plannedSpending;
}

export function getProjectedBalance(snapshot: BudgetSnapshot): number {
  return snapshot.monthlyBudget - getProjectedSpending(snapshot);
}

export function getBudgetUtilization(snapshot: BudgetSnapshot): number {
  if (snapshot.monthlyBudget <= 0) return 0;
  return (getProjectedSpending(snapshot) / snapshot.monthlyBudget) * 100;
}

export function getBudgetStatus(snapshot: BudgetSnapshot): BudgetStatus {
  const projectedBalance = getProjectedBalance(snapshot);
  if (projectedBalance < 0) return 'over-budget';
  const utilization = getBudgetUtilization(snapshot) / 100;
  if (utilization >= NEAR_LIMIT_THRESHOLD) return 'near-limit';
  return 'within-budget';
}
