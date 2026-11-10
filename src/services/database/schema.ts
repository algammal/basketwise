/**
 * SQLite schema. Price observations are append-only (new INSERT per scan) —
 * nothing here ever UPDATEs a price_observations row — so historical prices
 * stay immutable even when a product is rescanned at a new price.
 */
export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS supermarkets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_key TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS supermarket_branches (
    id TEXT PRIMARY KEY,
    supermarket_id TEXT NOT NULL REFERENCES supermarkets(id),
    name TEXT NOT NULL,
    address TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    category_id TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_size REAL NOT NULL,
    image_uri TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    supermarket_id TEXT NOT NULL REFERENCES supermarkets(id),
    branch_id TEXT REFERENCES supermarket_branches(id),
    purchase_date TEXT NOT NULL,
    total_amount REAL NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    item_count INTEGER NOT NULL,
    image_uri TEXT,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS receipt_items (
    id TEXT PRIMARY KEY,
    receipt_id TEXT NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    raw_name TEXT NOT NULL,
    brand TEXT,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    discount_amount REAL NOT NULL DEFAULT 0,
    line_total REAL NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS product_price_observations (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    supermarket_id TEXT NOT NULL REFERENCES supermarkets(id),
    branch_id TEXT REFERENCES supermarket_branches(id),
    receipt_id TEXT NOT NULL REFERENCES receipts(id),
    price REAL NOT NULL,
    discount_amount REAL NOT NULL DEFAULT 0,
    observed_at TEXT NOT NULL,
    currency TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS product_preferences (
    product_id TEXT PRIMARY KEY REFERENCES products(id),
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_must_buy INTEGER NOT NULL DEFAULT 0
  );`,
  `CREATE TABLE IF NOT EXISTS shopping_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS shopping_plan_items (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL REFERENCES shopping_plans(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    custom_name TEXT,
    quantity REAL NOT NULL,
    estimated_unit_price REAL,
    recommended_supermarket_id TEXT REFERENCES supermarkets(id),
    priority TEXT NOT NULL DEFAULT 'normal',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_must_buy INTEGER NOT NULL DEFAULT 0
  );`,
  `CREATE TABLE IF NOT EXISTS household_budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    month TEXT NOT NULL,
    monthly_amount REAL NOT NULL,
    currency TEXT NOT NULL,
    UNIQUE(user_id, month)
  );`,
  `CREATE TABLE IF NOT EXISTS budget_category_allocations (
    budget_id TEXT NOT NULL REFERENCES household_budgets(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    allocated_amount REAL NOT NULL,
    PRIMARY KEY (budget_id, category_id)
  );`,
  `CREATE INDEX IF NOT EXISTS idx_price_obs_product ON product_price_observations(product_id);`,
  `CREATE INDEX IF NOT EXISTS idx_price_obs_supermarket ON product_price_observations(supermarket_id);`,
  `CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON receipt_items(receipt_id);`,
];

export const DATABASE_NAME = 'basketwise.db';
