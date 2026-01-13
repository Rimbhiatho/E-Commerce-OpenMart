import { WalletRepository as WalletRepositoryInterface } from '../../domain/repositories/WalletRepository';
import { WalletTransaction, TopUpDTO } from '../../domain/entities/User';
import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';

export class WalletRepositoryImpl implements WalletRepositoryInterface {
  async getBalance(userId: string): Promise<number> {
    const db = await getDatabase();
    const row = await db.get('SELECT balance FROM users WHERE id = ?', [userId]);
    return row ? (row.balance as number) : 0;
  }

  async topUp(userId: string, dto: TopUpDTO): Promise<{ balance: number; transaction: WalletTransaction }> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();

    // Get current balance
    const currentRow = await db.get('SELECT balance FROM users WHERE id = ?', [userId]);
    const currentBalance = currentRow ? (currentRow.balance as number) : 0;
    const newBalance = currentBalance + dto.amount;

    // Start transaction
    await db.exec('BEGIN TRANSACTION');

    try {
      // Update user balance
      await db.run(
        'UPDATE users SET balance = ?, updatedAt = ? WHERE id = ?',
        [newBalance, now, userId]
      );

      // Create transaction record
      await db.run(
        `INSERT INTO wallet_transactions 
         (id, userId, type, amount, balanceBefore, balanceAfter, description, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, 'credit', dto.amount, currentBalance, newBalance, dto.description || 'Wallet Top-up', now]
      );

      await db.exec('COMMIT');

      const transaction: WalletTransaction = {
        id,
        userId,
        type: 'credit',
        amount: dto.amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: dto.description || 'Wallet Top-up',
        createdAt: new Date(now)
      };

      return { balance: newBalance, transaction };
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  }

  async deduct(
    userId: string,
    amount: number,
    description: string
  ): Promise<{ balance: number; transaction: WalletTransaction }> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();

    // Get current balance
    const currentRow = await db.get('SELECT balance FROM users WHERE id = ?', [userId]);
    const currentBalance = currentRow ? (currentRow.balance as number) : 0;

    // Check if sufficient balance
    if (currentBalance < amount) {
      throw new Error('Insufficient Funds');
    }

    const newBalance = currentBalance - amount;

    // Start transaction
    await db.exec('BEGIN TRANSACTION');

    try {
      // Update user balance
      await db.run(
        'UPDATE users SET balance = ?, updatedAt = ? WHERE id = ?',
        [newBalance, now, userId]
      );

      // Create transaction record
      await db.run(
        `INSERT INTO wallet_transactions 
         (id, userId, type, amount, balanceBefore, balanceAfter, description, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, 'debit', amount, currentBalance, newBalance, description, now]
      );

      await db.exec('COMMIT');

      const transaction: WalletTransaction = {
        id,
        userId,
        type: 'debit',
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description,
        createdAt: new Date(now)
      };

      return { balance: newBalance, transaction };
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  }

  async getTransactionHistory(userId: string): Promise<WalletTransaction[]> {
    const db = await getDatabase();
    const rows = await db.all(
      `SELECT * FROM wallet_transactions WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    );

    return rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      type: row.type as 'credit' | 'debit',
      amount: row.amount,
      balanceBefore: row.balanceBefore,
      balanceAfter: row.balanceAfter,
      description: row.description,
      createdAt: new Date(row.createdAt)
    }));
  }

  async initializeBalance(userId: string): Promise<void> {
    const db = await getDatabase();
    await db.run('UPDATE users SET balance = 0 WHERE id = ?', [userId]);
  }
}

export const walletRepository = new WalletRepositoryImpl();

