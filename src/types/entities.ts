/**
 * Core domain entities. Kept independent of UI and persistence so the same
 * shapes work against SQLite now and a future backend later.
 */

export type CurrencyCode = 'EGP' | 'USD' | 'EUR';

export type ProductCategoryId =
  | 'food-groceries'
  | 'cleaning-supplies'
  | 'personal-care'
  | 'beverages'
  | 'household-essentials'
  | 'other';

export interface ProductCategory {
  id: ProductCategoryId;
  label: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  currency: CurrencyCode;
  createdAt: string;
}

export interface HouseholdBudget {
  id: string;
  userId: string;
  month: string; // ISO yyyy-MM
  monthlyAmount: number;
  currency: CurrencyCode;
  categoryAllocations: BudgetCategoryAllocation[];
}

export interface BudgetCategoryAllocation {
  categoryId: ProductCategoryId;
  allocatedAmount: number;
}

export interface Supermarket {
  id: string;
  name: string;
  logoKey: string;
  branches?: SupermarketBranch[];
}

export interface SupermarketBranch {
  id: string;
  supermarketId: string;
  name: string;
  address?: string;
}

export type ReceiptStatus = 'processing' | 'needs-review' | 'confirmed';

export interface Receipt {
  id: string;
  supermarketId: string;
  branchId?: string;
  purchaseDate: string; // ISO date
  totalAmount: number;
  currency: CurrencyCode;
  status: ReceiptStatus;
  itemCount: number;
  imageUri?: string;
  createdAt: string;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  productId?: string;
  rawName: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export type ProductUnit = 'kg' | 'g' | 'l' | 'ml' | 'pcs';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  categoryId: ProductCategoryId;
  unit: ProductUnit;
  unitSize: number; // e.g. 500 for "500 g"
  imageUri?: string;
}

export interface ProductPriceObservation {
  id: string;
  productId: string;
  supermarketId: string;
  branchId?: string;
  receiptId: string;
  price: number;
  discountAmount: number;
  observedAt: string; // ISO date — when the receipt was dated, not scanned
  currency: CurrencyCode;
}

export interface ProductPreference {
  productId: string;
  isFavorite: boolean;
  isMustBuy: boolean;
}

export type PlanPriority = 'low' | 'normal' | 'high';

export interface ShoppingPlan {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  items: ShoppingPlanItem[];
}

export interface ShoppingPlanItem {
  id: string;
  planId: string;
  productId?: string;
  customName?: string;
  quantity: number;
  estimatedUnitPrice?: number;
  recommendedSupermarketId?: string;
  priority: PlanPriority;
  isFavorite: boolean;
  isMustBuy: boolean;
}

export type OptimizationStrategy = 'single-supermarket' | 'maximum-savings' | 'personalized';

export interface PurchaseRecommendation {
  id: string;
  planId: string;
  strategy: OptimizationStrategy;
  totalEstimatedCost: number;
  supermarketAllocations: SupermarketAllocation[];
  potentialSavings: number;
  missingPriceProductIds: string[];
  stalePriceProductIds: string[];
  generatedAt: string;
}

export interface SupermarketAllocation {
  supermarketId: string;
  items: { planItemId: string; unitPrice: number; quantity: number; lineTotal: number }[];
  subtotal: number;
}
