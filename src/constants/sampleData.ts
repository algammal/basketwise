import type {
  Product,
  ProductPriceObservation,
  Receipt,
  ReceiptItem,
  HouseholdBudget,
} from '../types/entities';
import { SAMPLE_SUPERMARKETS } from './supermarkets';

/**
 * Illustrative development/demo data only — clearly not real supermarket
 * pricing. Used to populate the UI before a user has scanned any receipts,
 * and in tests for the finance/pricing utilities.
 */

const CARREFOUR = SAMPLE_SUPERMARKETS[0].id;
const SPINNEYS = SAMPLE_SUPERMARKETS[1].id;
const METRO = SAMPLE_SUPERMARKETS[2].id;
const HYPER_ONE = SAMPLE_SUPERMARKETS[3].id;

export const SAMPLE_PRODUCTS: Product[] = [
  { id: 'p-olive-oil-1l', name: 'Olive Oil', brand: 'Afia', categoryId: 'food-groceries', unit: 'l', unitSize: 1 },
  { id: 'p-basmati-rice-2kg', name: 'Basmati Rice', brand: 'Sultan', categoryId: 'food-groceries', unit: 'kg', unitSize: 2 },
  { id: 'p-laundry-detergent-3l', name: 'Laundry Detergent', brand: 'Persil', categoryId: 'cleaning-supplies', unit: 'l', unitSize: 3 },
  { id: 'p-shampoo-400ml', name: 'Shampoo', brand: 'Pantene', categoryId: 'personal-care', unit: 'ml', unitSize: 400 },
  { id: 'p-sparkling-water-6pk', name: 'Sparkling Water 6-pack', brand: 'Baraka', categoryId: 'beverages', unit: 'pcs', unitSize: 6 },
];

export const SAMPLE_PRICE_OBSERVATIONS: ProductPriceObservation[] = [
  { id: 'obs-1', productId: 'p-olive-oil-1l', supermarketId: CARREFOUR, receiptId: 'r-1', price: 189, discountAmount: 0, observedAt: '2026-10-02', currency: 'EGP' },
  { id: 'obs-2', productId: 'p-olive-oil-1l', supermarketId: SPINNEYS, receiptId: 'r-2', price: 205, discountAmount: 0, observedAt: '2026-10-10', currency: 'EGP' },
  { id: 'obs-3', productId: 'p-olive-oil-1l', supermarketId: METRO, receiptId: 'r-3', price: 179, discountAmount: 10, observedAt: '2026-10-20', currency: 'EGP' },
  { id: 'obs-4', productId: 'p-basmati-rice-2kg', supermarketId: CARREFOUR, receiptId: 'r-1', price: 95.5, discountAmount: 0, observedAt: '2026-10-02', currency: 'EGP' },
  { id: 'obs-5', productId: 'p-basmati-rice-2kg', supermarketId: HYPER_ONE, receiptId: 'r-4', price: 88, discountAmount: 0, observedAt: '2026-10-25', currency: 'EGP' },
  { id: 'obs-6', productId: 'p-laundry-detergent-3l', supermarketId: SPINNEYS, receiptId: 'r-2', price: 310, discountAmount: 20, observedAt: '2026-10-10', currency: 'EGP' },
  { id: 'obs-7', productId: 'p-shampoo-400ml', supermarketId: METRO, receiptId: 'r-3', price: 145, discountAmount: 0, observedAt: '2026-10-20', currency: 'EGP' },
];

export const SAMPLE_RECEIPTS: Receipt[] = [
  { id: 'r-1', supermarketId: CARREFOUR, purchaseDate: '2026-10-02', totalAmount: 284.5, currency: 'EGP', status: 'confirmed', itemCount: 2, createdAt: '2026-10-02T10:12:00.000Z' },
  { id: 'r-2', supermarketId: SPINNEYS, purchaseDate: '2026-10-10', totalAmount: 495, currency: 'EGP', status: 'confirmed', itemCount: 2, createdAt: '2026-10-10T18:40:00.000Z' },
  { id: 'r-3', supermarketId: METRO, purchaseDate: '2026-10-20', totalAmount: 314, currency: 'EGP', status: 'confirmed', itemCount: 2, createdAt: '2026-10-20T09:05:00.000Z' },
  { id: 'r-4', supermarketId: HYPER_ONE, purchaseDate: '2026-10-25', totalAmount: 88, currency: 'EGP', status: 'confirmed', itemCount: 1, createdAt: '2026-10-25T16:22:00.000Z' },
];

export const SAMPLE_RECEIPT_ITEMS: ReceiptItem[] = [
  { id: 'ri-1', receiptId: 'r-1', productId: 'p-olive-oil-1l', rawName: 'Olive Oil 1L', quantity: 1, unitPrice: 189, discountAmount: 0, lineTotal: 189 },
  { id: 'ri-2', receiptId: 'r-1', productId: 'p-basmati-rice-2kg', rawName: 'Basmati Rice 2kg', quantity: 1, unitPrice: 95.5, discountAmount: 0, lineTotal: 95.5 },
  { id: 'ri-3', receiptId: 'r-2', productId: 'p-olive-oil-1l', rawName: 'Olive Oil 1L', quantity: 1, unitPrice: 205, discountAmount: 0, lineTotal: 205 },
  { id: 'ri-4', receiptId: 'r-2', productId: 'p-laundry-detergent-3l', rawName: 'Laundry Detergent 3L', quantity: 1, unitPrice: 310, discountAmount: 20, lineTotal: 290 },
  { id: 'ri-5', receiptId: 'r-3', productId: 'p-olive-oil-1l', rawName: 'Olive Oil 1L', quantity: 1, unitPrice: 179, discountAmount: 10, lineTotal: 169 },
  { id: 'ri-6', receiptId: 'r-3', productId: 'p-shampoo-400ml', rawName: 'Shampoo 400ml', quantity: 1, unitPrice: 145, discountAmount: 0, lineTotal: 145 },
  { id: 'ri-7', receiptId: 'r-4', productId: 'p-basmati-rice-2kg', rawName: 'Basmati Rice 2kg', quantity: 1, unitPrice: 88, discountAmount: 0, lineTotal: 88 },
];

export const SAMPLE_BUDGET: HouseholdBudget = {
  id: 'budget-2026-11',
  userId: 'user-1',
  month: '2026-11',
  monthlyAmount: 10000,
  currency: 'EGP',
  categoryAllocations: [
    { categoryId: 'food-groceries', allocatedAmount: 5000 },
    { categoryId: 'cleaning-supplies', allocatedAmount: 1200 },
    { categoryId: 'personal-care', allocatedAmount: 1000 },
    { categoryId: 'beverages', allocatedAmount: 800 },
    { categoryId: 'household-essentials', allocatedAmount: 1500 },
    { categoryId: 'other', allocatedAmount: 500 },
  ],
};
