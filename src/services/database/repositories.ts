import type {
  Receipt,
  ReceiptItem,
  Product,
  ProductPriceObservation,
  ProductPreference,
  ShoppingPlan,
  HouseholdBudget,
} from '../../types/entities';

/**
 * Repository interfaces that sit between Redux/UI and storage. The current
 * implementation targets Expo SQLite; swapping to a remote Postgres-backed
 * API later only means writing a new class against these same interfaces.
 */

export interface ReceiptRepository {
  getAll(): Promise<Receipt[]>;
  getById(id: string): Promise<Receipt | null>;
  getItems(receiptId: string): Promise<ReceiptItem[]>;
  /** Creates the receipt and its items, and appends new price observations — never overwrites prior history. */
  create(receipt: Receipt, items: ReceiptItem[]): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  search(query: string): Promise<Product[]>;
  upsert(product: Product): Promise<void>;
  getPriceObservations(productId: string): Promise<ProductPriceObservation[]>;
  addPriceObservation(observation: ProductPriceObservation): Promise<void>;
  getPreference(productId: string): Promise<ProductPreference | null>;
  setPreference(preference: ProductPreference): Promise<void>;
}

export interface PlanningRepository {
  getPlans(): Promise<ShoppingPlan[]>;
  getPlan(id: string): Promise<ShoppingPlan | null>;
  savePlan(plan: ShoppingPlan): Promise<void>;
  deletePlan(id: string): Promise<void>;
}

export interface BudgetRepository {
  getBudgetForMonth(month: string): Promise<HouseholdBudget | null>;
  saveBudget(budget: HouseholdBudget): Promise<void>;
  getHistory(): Promise<HouseholdBudget[]>;
}
