import { WalletRepository } from '../repositories/WalletRepository';
import { WalletTransaction, WalletResponse, TopUpDTO } from '../entities/User';

export class WalletUseCase {
  constructor(private walletRepository: WalletRepository) {}

  /**
   * Get user's current wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    return this.walletRepository.getBalance(userId);
  }

  /**
   * Top up user's wallet balance
   */
  async topUp(userId: string, dto: TopUpDTO): Promise<{ balance: number; transaction: WalletTransaction }> {
    // Validate amount
    if (dto.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (dto.amount > 1000000) {
      throw new Error('Maximum top-up amount is 1,000,000');
    }

    return this.walletRepository.topUp(userId, dto);
  }

  /**
   * Get wallet info including balance and transaction history
   */
  async getWalletInfo(userId: string): Promise<WalletResponse> {
    const balance = await this.walletRepository.getBalance(userId);
    const transactions = await this.walletRepository.getTransactionHistory(userId);

    return {
      balance,
      transactions
    };
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(userId: string): Promise<WalletTransaction[]> {
    return this.walletRepository.getTransactionHistory(userId);
  }

  /**
   * Deduct amount from wallet (used by OrderUseCase)
   * This is an internal method for order payment processing
   */
  async deductForOrder(userId: string, amount: number, orderId: string): Promise<{ balance: number; transaction: WalletTransaction }> {
    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Check current balance first
    const currentBalance = await this.walletRepository.getBalance(userId);
    if (currentBalance < amount) {
      throw new Error('Insufficient Funds');
    }

    return this.walletRepository.deduct(userId, amount, `Payment for order ${orderId}`);
  }

  /**
   * Initialize wallet for a new user
   */
  async initializeWallet(userId: string): Promise<void> {
    await this.walletRepository.initializeBalance(userId);
  }
}

