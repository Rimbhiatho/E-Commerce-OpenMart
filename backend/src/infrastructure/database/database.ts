import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Variabel untuk menyimpan koneksi
let db: Database | null = null;

export const getDatabase = async (): Promise<Database> => {
  if (db) {
    console.log('[DB] Returning existing database connection');
    return db;
  }

  const dbPath = path.resolve(process.cwd(), 'data', 'openmart.db');
  console.log(`[DB] Connecting to database at: ${dbPath}`);

  // PERBAIKAN: Menggunakan 'open' dari library 'sqlite' agar support Async/Await
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Configure for better async handling
    await db.configure('busyTimeout', 5000);
    console.log('[DB] Connected successfully to SQLite database');
    return db;
  } catch (err) {
    console.error('[DB] Error connecting to database:', err);
    throw err;
  }
};

export const initializeDatabase = async (): Promise<void> => {
  console.log('[DB] Starting database initialization...');
  const database = await getDatabase();
  console.log('[DB] Database connection obtained for initialization');

  // PERBAIKAN: Tidak perlu .serialize() callback hell.
  // Gunakan await db.exec() untuk membuat tabel secara berurutan.
  
  try {
    console.log('[DB] Creating tables if not exist...');
    
    // Create users table
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
    console.log('[DB] Users table ready');

    // Create categories table
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
    console.log('[DB] Categories table ready');

    // Create products table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
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
    console.log('[DB] Products table ready');

    // Create orders table
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
    console.log('[DB] Orders table ready');

    // Create wallet_transactions table for wallet audit trail
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
    console.log('[DB] Wallet transactions table ready');

    // Create indexes
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId)`);
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId)`);
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(isActive)`);
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(userId)`);
    console.log('[DB] Indexes created');

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('[DB] Error initializing database tables:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    console.log('Database connection closed');
    db = null;
  }
};

// Export db instance (walaupun disarankan pakai getDatabase() agar aman)
export { db as database };