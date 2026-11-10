import type { ProductCategory } from '../types/entities';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'food-groceries', label: 'Food & Groceries', icon: 'carrot' },
  { id: 'cleaning-supplies', label: 'Cleaning Supplies', icon: 'spray-can' },
  { id: 'personal-care', label: 'Personal Care', icon: 'sparkles' },
  { id: 'beverages', label: 'Beverages', icon: 'cup-soda' },
  { id: 'household-essentials', label: 'Household Essentials', icon: 'home' },
  { id: 'other', label: 'Other', icon: 'ellipsis' },
];
