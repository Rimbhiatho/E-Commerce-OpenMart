import { WalletRepository } from '../repositories/WalletRepository';
import { WalletTransaction, WalletResponse, TopUpDTO } from '../entities/User';
export declare class WalletUseCase {
    private walletRepository;
    constructor(walletRepository: WalletRepository);
    /**
     * Get user's current wallet balance
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
     * Get wallet info including balance and transaction history
     */
    getWalletInfo(userId: string): Promise<WalletResponse>;
    /**
     * Get transaction history for a user
     */
    getTransactionHistory(userId: string): Promise<WalletTransaction[]>;
    /**
     * Deduct amount from wallet (used by OrderUseCase)
     * This is an internal method for order payment processing
     */
    deductForOrder(userId: string, amount: number, orderId: string): Promise<{
        balance: number;
        transaction: WalletTransaction;
    }>;
    /**
     * Initialize wallet for a new user
     */
    initializeWallet(userId: string): Promise<void>;
}
//# sourceMappingURL=WalletUseCase.d.ts.map