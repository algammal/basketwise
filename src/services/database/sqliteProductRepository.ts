import { getDatabase } from './db';
import type { ProductRepository } from './repositories';
import type { Product, ProductPriceObservation, ProductPreference, ProductCategoryId, ProductUnit } from '../../types/entities';

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  category_id: ProductCategoryId;
  unit: ProductUnit;
  unit_size: number;
  image_uri: string | null;
}

interface PriceObservationRow {
  id: string;
  product_id: string;
  supermarket_id: string;
  branch_id: string | null;
  receipt_id: string;
  price: number;
  discount_amount: number;
  observed_at: string;
  currency: ProductPriceObservation['currency'];
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? undefined,
    categoryId: row.category_id,
    unit: row.unit,
    unitSize: row.unit_size,
    imageUri: row.image_uri ?? undefined,
  };
}

function rowToObservation(row: PriceObservationRow): ProductPriceObservation {
  return {
    id: row.id,
    productId: row.product_id,
    supermarketId: row.supermarket_id,
    branchId: row.branch_id ?? undefined,
    receiptId: row.receipt_id,
    price: row.price,
    discountAmount: row.discount_amount,
    observedAt: row.observed_at,
    currency: row.currency,
  };
}

export class SqliteProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ProductRow>('SELECT * FROM products ORDER BY name ASC;');
    return rows.map(rowToProduct);
  }

  async getById(id: string): Promise<Product | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE id = ?;', [id]);
    return row ? rowToProduct(row) : null;
  }

  async search(query: string): Promise<Product[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ProductRow>('SELECT * FROM products WHERE name LIKE ? ORDER BY name ASC;', [
      `%${query}%`,
    ]);
    return rows.map(rowToProduct);
  }

  async upsert(product: Product): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO products (id, name, brand, category_id, unit, unit_size, image_uri)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, brand=excluded.brand, category_id=excluded.category_id,
         unit=excluded.unit, unit_size=excluded.unit_size, image_uri=excluded.image_uri;`,
      [product.id, product.name, product.brand ?? null, product.categoryId, product.unit, product.unitSize, product.imageUri ?? null],
    );
  }

  async getPriceObservations(productId: string): Promise<ProductPriceObservation[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PriceObservationRow>(
      'SELECT * FROM product_price_observations WHERE product_id = ? ORDER BY observed_at ASC;',
      [productId],
    );
    return rows.map(rowToObservation);
  }

  /** Always an INSERT — price history is append-only, never overwritten. */
  async addPriceObservation(observation: ProductPriceObservation): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO product_price_observations (id, product_id, supermarket_id, branch_id, receipt_id, price, discount_amount, observed_at, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        observation.id,
        observation.productId,
        observation.supermarketId,
        observation.branchId ?? null,
        observation.receiptId,
        observation.price,
        observation.discountAmount,
        observation.observedAt,
        observation.currency,
      ],
    );
  }

  async getPreference(productId: string): Promise<ProductPreference | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ product_id: string; is_favorite: number; is_must_buy: number }>(
      'SELECT * FROM product_preferences WHERE product_id = ?;',
      [productId],
    );
    if (!row) return null;
    return { productId: row.product_id, isFavorite: !!row.is_favorite, isMustBuy: !!row.is_must_buy };
  }

  async setPreference(preference: ProductPreference): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO product_preferences (product_id, is_favorite, is_must_buy)
       VALUES (?, ?, ?)
       ON CONFLICT(product_id) DO UPDATE SET is_favorite=excluded.is_favorite, is_must_buy=excluded.is_must_buy;`,
      [preference.productId, preference.isFavorite ? 1 : 0, preference.isMustBuy ? 1 : 0],
    );
  }
}

export const sqliteProductRepository = new SqliteProductRepository();
