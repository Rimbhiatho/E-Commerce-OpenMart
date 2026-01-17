import { Database } from 'sqlite';
import { getDatabase } from '../database/database';
import { CartItem, CartItemInput } from '../../domain/entities/Cart';
import { v4 as uuidv4 } from 'uuid';

export class CartRepositoryImpl {
  private db: Database | null = null;

  private async getDb(): Promise<Database> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  /// Get all cart items for a user
  async getCartByUserId(userId: string): Promise<CartItem[]> {
    const database = await this.getDb();
    const rows = await database.all(
      'SELECT * FROM cart_items WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      title: row.title,
      imageUrl: row.imageUrl,
      price: row.price,
      quantity: row.quantity,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  /// Add item to cart (or update quantity if exists)
  async addToCart(input: CartItemInput): Promise<CartItem> {
    const database = await this.getDb();
    
    // Check if item already exists in cart
    const existing = await database.get(
      'SELECT * FROM cart_items WHERE userId = ? AND productId = ?',
      [input.userId, input.productId]
    );

    if (existing) {
      // Update quantity
      const newQuantity = existing.quantity + input.quantity;
      await database.run(
        `UPDATE cart_items 
         SET quantity = ?, updatedAt = datetime('now') 
         WHERE userId = ? AND productId = ?`,
        [newQuantity, input.userId, input.productId]
      );

      return {
        id: existing.id,
        userId: input.userId,
        productId: input.productId,
        title: input.title,
        imageUrl: input.imageUrl,
        price: input.price,
        quantity: newQuantity,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Insert new item
      const id = uuidv4();
      await database.run(
        `INSERT INTO cart_items 
         (id, userId, productId, title, imageUrl, price, quantity, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [id, input.userId, input.productId, input.title, input.imageUrl, input.price, input.quantity]
      );

      return {
        id,
        userId: input.userId,
        productId: input.productId,
        title: input.title,
        imageUrl: input.imageUrl,
        price: input.price,
        quantity: input.quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /// Update quantity of a cart item
  async updateQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | null> {
    const database = await this.getDb();
    
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return null;
    }

    await database.run(
      `UPDATE cart_items 
       SET quantity = ?, updatedAt = datetime('now') 
       WHERE userId = ? AND productId = ?`,
      [quantity, userId, productId]
    );

    const item = await database.get(
      'SELECT * FROM cart_items WHERE userId = ? AND productId = ?',
      [userId, productId]
    );

    if (!item) return null;

    return {
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /// Remove item from cart
  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    const database = await this.getDb();
    const result = await database.run(
      'DELETE FROM cart_items WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    return (result.changes ?? 0) > 0;
  }

  /// Clear all cart items for a user
  async clearCart(userId: string): Promise<boolean> {
    const database = await this.getDb();
    const result = await database.run(
      'DELETE FROM cart_items WHERE userId = ?',
      [userId]
    );
    return (result.changes ?? 0) > 0;
  }

  /// Get total item count for a user
  async getItemCount(userId: string): Promise<number> {
    const database = await this.getDb();
    const result = await database.get(
      'SELECT SUM(quantity) as total FROM cart_items WHERE userId = ?',
      [userId]
    );
    return result?.total ?? 0;
  }

  /// Get total price for a user's cart
  async getTotalPrice(userId: string): Promise<number> {
    const database = await this.getDb();
    const result = await database.get(
      'SELECT SUM(price * quantity) as total FROM cart_items WHERE userId = ?',
      [userId]
    );
    return result?.total ?? 0;
  }
}

export const cartRepository = new CartRepositoryImpl();

