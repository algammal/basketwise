import { getDatabase } from './db';
import type { BudgetRepository } from './repositories';
import type { HouseholdBudget, ProductCategoryId } from '../../types/entities';

interface BudgetRow {
  id: string;
  user_id: string;
  month: string;
  monthly_amount: number;
  currency: HouseholdBudget['currency'];
}

interface AllocationRow {
  budget_id: string;
  category_id: ProductCategoryId;
  allocated_amount: number;
}

async function attachAllocations(db: Awaited<ReturnType<typeof getDatabase>>, row: BudgetRow): Promise<HouseholdBudget> {
  const allocations = await db.getAllAsync<AllocationRow>('SELECT * FROM budget_category_allocations WHERE budget_id = ?;', [
    row.id,
  ]);
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    monthlyAmount: row.monthly_amount,
    currency: row.currency,
    categoryAllocations: allocations.map((a) => ({ categoryId: a.category_id, allocatedAmount: a.allocated_amount })),
  };
}

export class SqliteBudgetRepository implements BudgetRepository {
  async getBudgetForMonth(month: string): Promise<HouseholdBudget | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BudgetRow>('SELECT * FROM household_budgets WHERE month = ?;', [month]);
    return row ? attachAllocations(db, row) : null;
  }

  async saveBudget(budget: HouseholdBudget): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO household_budgets (id, user_id, month, monthly_amount, currency) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET monthly_amount=excluded.monthly_amount, currency=excluded.currency;`,
        [budget.id, budget.userId, budget.month, budget.monthlyAmount, budget.currency],
      );
      await db.runAsync('DELETE FROM budget_category_allocations WHERE budget_id = ?;', [budget.id]);
      for (const allocation of budget.categoryAllocations) {
        await db.runAsync(
          'INSERT INTO budget_category_allocations (budget_id, category_id, allocated_amount) VALUES (?, ?, ?);',
          [budget.id, allocation.categoryId, allocation.allocatedAmount],
        );
      }
    });
  }

  async getHistory(): Promise<HouseholdBudget[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BudgetRow>('SELECT * FROM household_budgets ORDER BY month DESC;');
    const budgets: HouseholdBudget[] = [];
    for (const row of rows) {
      budgets.push(await attachAllocations(db, row));
    }
    return budgets;
  }
}

export const sqliteBudgetRepository = new SqliteBudgetRepository();
