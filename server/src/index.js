import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = process.env.DB_PATH || './chicken_shop.db';
const db = new Database(DB_PATH);

// Initialize tables
const initSql = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price REAL NOT NULL CHECK(price >= 0),
  stock INTEGER NOT NULL CHECK(stock >= 0),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  total REAL NOT NULL CHECK(total >= 0),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  price REAL NOT NULL CHECK(price >= 0),
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
);
`;
db.exec(initSql);

// Schemas
const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative()
});

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable()
});

const orderSchema = z.object({
  customerId: z.number().int().optional(),
  items: z.array(z.object({
    productId: z.number().int(),
    quantity: z.number().int().positive()
  })).min(1)
});

// Helpers
function rowToCamel(row) {
  if (!row) return row;
  const result = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camel] = v;
  }
  return result;
}

function rowsToCamel(rows) { return rows.map(rowToCamel); }

// Products CRUD
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  res.json(rowsToCamel(rows));
});

app.post('/api/products', (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, sku, price, stock } = parsed.data;
  try {
    const info = db.prepare('INSERT INTO products (name, sku, price, stock) VALUES (?, ?, ?, ?)')
      .run(name, sku, price, stock);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(rowToCamel(row));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'SKU must be unique' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { name = existing.name, sku = existing.sku, price = existing.price, stock = existing.stock } = parsed.data;
  try {
    db.prepare('UPDATE products SET name = ?, sku = ?, price = ?, stock = ? WHERE id = ?')
      .run(name, sku, price, stock, id);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(rowToCamel(row));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'SKU must be unique' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Customers CRUD
app.get('/api/customers', (req, res) => {
  const rows = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
  res.json(rowsToCamel(rows));
});

app.post('/api/customers', (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, phone } = parsed.data;
  const info = db.prepare('INSERT INTO customers (name, phone) VALUES (?, ?)').run(name, phone ?? null);
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(rowToCamel(row));
});

app.put('/api/customers/:id', (req, res) => {
  const id = Number(req.params.id);
  const parsed = customerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { name = existing.name, phone = existing.phone } = parsed.data;
  db.prepare('UPDATE customers SET name = ?, phone = ? WHERE id = ?').run(name, phone ?? null, id);
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  res.json(rowToCamel(row));
});

app.delete('/api/customers/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Orders
app.get('/api/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const withItems = rows.map(row => {
    const items = db.prepare(`SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE order_id = ?`).all(row.id);
    return { ...rowToCamel(row), items: rowsToCamel(items).map(i => ({ ...i, productName: i.productName })) };
  });
  res.json(withItems);
});

app.post('/api/orders', (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { customerId, items } = parsed.data;

  const tx = db.transaction(() => {
    // Check stock
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      if (!product) throw new Error('Product not found: ' + item.productId);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}`);
    }
    // Create order
    let total = 0;
    const pricedItems = items.map(it => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(it.productId);
      const price = product.price;
      total += price * it.quantity;
      return { ...it, price };
    });
    const info = db.prepare('INSERT INTO orders (customer_id, total) VALUES (?, ?)')
      .run(customerId ?? null, total);
    const orderId = info.lastInsertRowid;
    // Insert items and decrement stock
    for (const it of pricedItems) {
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)')
        .run(orderId, it.productId, it.quantity, it.price);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(it.quantity, it.productId);
    }
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const itemsRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    return { ...rowToCamel(order), items: rowsToCamel(itemsRows) };
  });

  try {
    const result = tx();
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
