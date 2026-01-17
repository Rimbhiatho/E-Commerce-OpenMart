import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fetch from 'node-fetch';
let db = null;
export const getDatabase = async () => {
    if (db) {
        console.log('[DB] Returning existing database connection');
        return db;
    }
    const dbPath = path.resolve(process.cwd(), 'data', 'openmart.db');
    console.log(`[DB] Connecting to database at: ${dbPath}`);
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        await db.configure('busyTimeout', 5000);
        console.log('[DB] Connected successfully to SQLite database');
        return db;
    }
    catch (err) {
        console.error('[DB] Error connecting to database:', err);
        throw err;
    }
};
export const initializeDatabase = async () => {
    console.log('[DB] Starting database initialization...');
    const database = await getDatabase();
    console.log('[DB] Database connection obtained for initialization');
    try {
        console.log('[DB] Creating tables if not exist...');
        await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('customer', 'admin')) DEFAULT 'customer',
        balance REAL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
        await database.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        imageUrl TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
        await database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        categoryId TEXT,
        imageUrl TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );
    `);
        await database.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        items TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
        shippingAddress TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        paymentStatus TEXT CHECK(paymentStatus IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
        await database.exec(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT CHECK(type IN ('credit', 'debit')) NOT NULL,
        amount REAL NOT NULL,
        balanceBefore REAL NOT NULL,
        balanceAfter REAL NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
        // Cart items table for user shopping carts
        await database.exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        productId TEXT NOT NULL,
        title TEXT NOT NULL,
        imageUrl TEXT,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id),
        UNIQUE(userId, productId)
      );
    `);
        await database.exec(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId)`);
        await database.exec(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId)`);
        await database.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
        await database.exec(`CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(isActive)`);
        await database.exec(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(userId)`);
        await database.exec(`CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(userId)`);
        console.log('✅ Database tables initialized successfully');
        await seedProducts(database);
    }
    catch (error) {
        console.error('[DB] Error initializing database tables:', error);
        throw error;
    }
};
export const seedProducts = async (database) => {
    console.log('[DB] Seeding products from FakeStoreAPI...');
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const products = await response.json();
        for (const p of products) {
            await database.run(`
        INSERT OR REPLACE INTO products 
        (id, title, name, description, price, stock, categoryId, imageUrl, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
                p.id,
                p.title,
                p.title,
                p.description,
                p.price,
                10,
                p.category,
                p.image,
                1
            ]);
        }
        console.log('[DB] Products seeded successfully');
    }
    catch (err) {
        console.error('[DB] Failed to seed products:', err);
    }
};
export const closeDatabase = async () => {
    if (db) {
        await db.close();
        console.log('Database connection closed');
        db = null;
    }
};
export { db as database };
//# sourceMappingURL=database.js.map