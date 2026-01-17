export class WalletUseCase {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    /**
     * Get user's current wallet balance
     */
    async getBalance(userId) {
        return this.walletRepository.getBalance(userId);
    }
    /**
     * Top up user's wallet balance
     */
    async topUp(userId, dto) {
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
    async getWalletInfo(userId) {
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
    async getTransactionHistory(userId) {
        return this.walletRepository.getTransactionHistory(userId);
    }
    /**
     * Deduct amount from wallet (used by OrderUseCase)
     * This is an internal method for order payment processing
     */
    async deductForOrder(userId, amount, orderId) {
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
    async initializeWallet(userId) {
        await this.walletRepository.initializeBalance(userId);
    }
}
//# sourceMappingURL=WalletUseCase.js.map