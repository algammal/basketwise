import type { ProductCategoryId, Receipt, ReceiptItem, ShoppingPlanItem } from '../../types/entities';

export interface CategorySpending {
  categoryId: ProductCategoryId;
  actualAmount: number;
}

/**
 * Sums confirmed receipt line totals by category. Receipt items without a
 * resolved product (and therefore no category) are excluded rather than
 * guessed into a bucket.
 */
export function getActualSpendingByCategory(
  receipts: Receipt[],
  itemsByReceiptId: Record<string, ReceiptItem[]>,
  categoryOfProduct: (productId: string) => ProductCategoryId | undefined,
): CategorySpending[] {
  const totals = new Map<ProductCategoryId, number>();

  for (const receipt of receipts) {
    if (receipt.status !== 'confirmed') continue;
    for (const item of itemsByReceiptId[receipt.id] ?? []) {
      if (!item.productId) continue;
      const categoryId = categoryOfProduct(item.productId);
      if (!categoryId) continue;
      totals.set(categoryId, (totals.get(categoryId) ?? 0) + item.lineTotal);
    }
  }

  return Array.from(totals.entries()).map(([categoryId, actualAmount]) => ({ categoryId, actualAmount }));
}

export function getTotalActualSpending(receipts: Receipt[]): number {
  return receipts.filter((r) => r.status === 'confirmed').reduce((sum, r) => sum + r.totalAmount, 0);
}

export function getTotalPlannedSpending(items: ShoppingPlanItem[]): number {
  return items.reduce((sum, item) => sum + (item.estimatedUnitPrice ?? 0) * item.quantity, 0);
}

/** Receipts within a given ISO month ("2026-11"), by purchase date. */
export function filterReceiptsForMonth(receipts: Receipt[], isoMonth: string): Receipt[] {
  return receipts.filter((r) => r.purchaseDate.startsWith(isoMonth));
}
