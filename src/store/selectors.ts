import type { RootState } from './index';
import { getActualSpendingByCategory, getTotalActualSpending, getTotalPlannedSpending, filterReceiptsForMonth } from '../utils/finance/spending';
import { getAvailableBudget, getProjectedSpending, getProjectedBalance, getBudgetUtilization, getBudgetStatus, type BudgetSnapshot } from '../utils/finance/budget';
import { currentMonthIso } from '../utils/formatting/date';

export function selectBudgetSnapshot(state: RootState): BudgetSnapshot {
  const month = state.budget.currentBudget?.month ?? currentMonthIso();
  const receiptsThisMonth = filterReceiptsForMonth(state.receipts.receipts, month);
  const planItems = state.planning.plans.find((p) => p.id === state.planning.activePlanId)?.items ?? [];

  return {
    monthlyBudget: state.budget.currentBudget?.monthlyAmount ?? 0,
    actualSpending: getTotalActualSpending(receiptsThisMonth),
    plannedSpending: getTotalPlannedSpending(planItems),
  };
}

export function selectBudgetDerived(state: RootState) {
  const snapshot = selectBudgetSnapshot(state);
  return {
    snapshot,
    availableBudget: getAvailableBudget(snapshot),
    projectedSpending: getProjectedSpending(snapshot),
    projectedBalance: getProjectedBalance(snapshot),
    utilizationPercent: getBudgetUtilization(snapshot),
    status: getBudgetStatus(snapshot),
  };
}

export function selectCategorySpending(state: RootState) {
  const categoryOfProduct = (productId: string) => state.products.products.find((p) => p.id === productId)?.categoryId;
  return getActualSpendingByCategory(state.receipts.receipts, state.receipts.itemsByReceiptId, categoryOfProduct);
}
