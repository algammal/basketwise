import { getDatabase } from './db';
import type { ReceiptRepository } from './repositories';
import type { Receipt, ReceiptItem, ReceiptStatus } from '../../types/entities';

interface ReceiptRow {
  id: string;
  supermarket_id: string;
  branch_id: string | null;
  purchase_date: string;
  total_amount: number;
  currency: Receipt['currency'];
  status: ReceiptStatus;
  item_count: number;
  image_uri: string | null;
  created_at: string;
}

interface ReceiptItemRow {
  id: string;
  receipt_id: string;
  product_id: string | null;
  raw_name: string;
  brand: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
}

function rowToReceipt(row: ReceiptRow): Receipt {
  return {
    id: row.id,
    supermarketId: row.supermarket_id,
    branchId: row.branch_id ?? undefined,
    purchaseDate: row.purchase_date,
    totalAmount: row.total_amount,
    currency: row.currency,
    status: row.status,
    itemCount: row.item_count,
    imageUri: row.image_uri ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToReceiptItem(row: ReceiptItemRow): ReceiptItem {
  return {
    id: row.id,
    receiptId: row.receipt_id,
    productId: row.product_id ?? undefined,
    rawName: row.raw_name,
    brand: row.brand ?? undefined,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    discountAmount: row.discount_amount,
    lineTotal: row.line_total,
  };
}

export class SqliteReceiptRepository implements ReceiptRepository {
  async getAll(): Promise<Receipt[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReceiptRow>('SELECT * FROM receipts ORDER BY purchase_date DESC;');
    return rows.map(rowToReceipt);
  }

  async getById(id: string): Promise<Receipt | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ReceiptRow>('SELECT * FROM receipts WHERE id = ?;', [id]);
    return row ? rowToReceipt(row) : null;
  }

  async getItems(receiptId: string): Promise<ReceiptItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReceiptItemRow>('SELECT * FROM receipt_items WHERE receipt_id = ?;', [receiptId]);
    return rows.map(rowToReceiptItem);
  }

  /**
   * Inserts the receipt, its line items, and one price observation per item
   * that resolved to a product. Never touches an existing
   * product_price_observations row — rescanning a product at a new price
   * always appends a new observation, keeping history immutable.
   */
  async create(receipt: Receipt, items: ReceiptItem[]): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO receipts (id, supermarket_id, branch_id, purchase_date, total_amount, currency, status, item_count, image_uri, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          receipt.id,
          receipt.supermarketId,
          receipt.branchId ?? null,
          receipt.purchaseDate,
          receipt.totalAmount,
          receipt.currency,
          receipt.status,
          receipt.itemCount,
          receipt.imageUri ?? null,
          receipt.createdAt,
        ],
      );

      for (const item of items) {
        await db.runAsync(
          `INSERT INTO receipt_items (id, receipt_id, product_id, raw_name, brand, quantity, unit_price, discount_amount, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            item.id,
            item.receiptId,
            item.productId ?? null,
            item.rawName,
            item.brand ?? null,
            item.quantity,
            item.unitPrice,
            item.discountAmount,
            item.lineTotal,
          ],
        );

        if (item.productId) {
          await db.runAsync(
            `INSERT INTO product_price_observations (id, product_id, supermarket_id, branch_id, receipt_id, price, discount_amount, observed_at, currency)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              `obs-${item.id}`,
              item.productId,
              receipt.supermarketId,
              receipt.branchId ?? null,
              receipt.id,
              item.unitPrice,
              item.discountAmount,
              receipt.purchaseDate,
              receipt.currency,
            ],
          );
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM receipts WHERE id = ?;', [id]);
  }
}

export const sqliteReceiptRepository = new SqliteReceiptRepository();
