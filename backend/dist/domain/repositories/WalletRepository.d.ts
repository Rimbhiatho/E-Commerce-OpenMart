import { WalletTransaction, TopUpDTO } from '../entities/User';
export interface WalletRepository {
    /**
     * Get current balance for a user
     */
    getBalance(userId: string): Promise<number>;
    /**
     * Top up user's wallet balance
     */
    topUp(userId: string, dto: TopUpDTO): Promise<{
        balance: number;
        transaction: WalletTransaction;
    }>;
    /**
     * Deduct amount from user's wallet (for order payment)
     */
    deduct(userId: string, amount: number, description: string): Promise<{
        balance: number;
        transaction: WalletTransaction;
    }>;
    /**
     * Get transaction history for a user
     */
    getTransactionHistory(userId: string): Promise<WalletTransaction[]>;
    /**
     * Initialize balance for a user (called when user is created)
     */
    initializeBalance(userId: string): Promise<void>;
}
//# sourceMappingURL=WalletRepository.d.ts.map