import { getDatabase } from './db';
import type { PlanningRepository } from './repositories';
import type { ShoppingPlan, ShoppingPlanItem, PlanPriority } from '../../types/entities';

interface PlanRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

interface PlanItemRow {
  id: string;
  plan_id: string;
  product_id: string | null;
  custom_name: string | null;
  quantity: number;
  estimated_unit_price: number | null;
  recommended_supermarket_id: string | null;
  priority: PlanPriority;
  is_favorite: number;
  is_must_buy: number;
}

function rowToItem(row: PlanItemRow): ShoppingPlanItem {
  return {
    id: row.id,
    planId: row.plan_id,
    productId: row.product_id ?? undefined,
    customName: row.custom_name ?? undefined,
    quantity: row.quantity,
    estimatedUnitPrice: row.estimated_unit_price ?? undefined,
    recommendedSupermarketId: row.recommended_supermarket_id ?? undefined,
    priority: row.priority,
    isFavorite: !!row.is_favorite,
    isMustBuy: !!row.is_must_buy,
  };
}

export class SqlitePlanningRepository implements PlanningRepository {
  async getPlans(): Promise<ShoppingPlan[]> {
    const db = await getDatabase();
    const planRows = await db.getAllAsync<PlanRow>('SELECT * FROM shopping_plans ORDER BY created_at DESC;');
    const plans: ShoppingPlan[] = [];
    for (const planRow of planRows) {
      const itemRows = await db.getAllAsync<PlanItemRow>('SELECT * FROM shopping_plan_items WHERE plan_id = ?;', [planRow.id]);
      plans.push({ id: planRow.id, userId: planRow.user_id, name: planRow.name, createdAt: planRow.created_at, items: itemRows.map(rowToItem) });
    }
    return plans;
  }

  async getPlan(id: string): Promise<ShoppingPlan | null> {
    const db = await getDatabase();
    const planRow = await db.getFirstAsync<PlanRow>('SELECT * FROM shopping_plans WHERE id = ?;', [id]);
    if (!planRow) return null;
    const itemRows = await db.getAllAsync<PlanItemRow>('SELECT * FROM shopping_plan_items WHERE plan_id = ?;', [id]);
    return { id: planRow.id, userId: planRow.user_id, name: planRow.name, createdAt: planRow.created_at, items: itemRows.map(rowToItem) };
  }

  async savePlan(plan: ShoppingPlan): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO shopping_plans (id, user_id, name, created_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name;`,
        [plan.id, plan.userId, plan.name, plan.createdAt],
      );
      await db.runAsync('DELETE FROM shopping_plan_items WHERE plan_id = ?;', [plan.id]);
      for (const item of plan.items) {
        await db.runAsync(
          `INSERT INTO shopping_plan_items (id, plan_id, product_id, custom_name, quantity, estimated_unit_price, recommended_supermarket_id, priority, is_favorite, is_must_buy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            item.id,
            plan.id,
            item.productId ?? null,
            item.customName ?? null,
            item.quantity,
            item.estimatedUnitPrice ?? null,
            item.recommendedSupermarketId ?? null,
            item.priority,
            item.isFavorite ? 1 : 0,
            item.isMustBuy ? 1 : 0,
          ],
        );
      }
    });
  }

  async deletePlan(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM shopping_plans WHERE id = ?;', [id]);
  }
}

export const sqlitePlanningRepository = new SqlitePlanningRepository();
