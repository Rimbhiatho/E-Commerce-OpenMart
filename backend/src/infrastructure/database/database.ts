import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export const getDatabase = async (): Promise<Database> => {
  if (db) {
    return db;
  }

  const dbPath = path.resolve(process.cwd(), 'data', 'openmart.db');
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      throw err;
    }
    console.log('Connected to SQLite database');
  });

  return db;
};

export const initializeDatabase = async (): Promise<void> => {
  const database = await getDatabase();

  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Create users table
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT CHECK(role IN ('customer', 'admin')) DEFAULT 'customer',
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      // Create categories table
      database.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT,
          isActive INTEGER DEFAULT 1,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      // Create products table
      database.run(`
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
        )
      `);

      // Create orders table
      database.run(`
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
        )
      `);

      // Create indexes for better query performance
      database.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(isActive)`);

      console.log('Database tables initialized successfully');
      resolve();
    });
  });
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    return new Promise((resolve, reject) => {
      db!.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('Database connection closed');
          db = null;
          resolve();
        }
      });
    });
  }
};

export { db as database };

