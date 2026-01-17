export class WalletController {
    constructor(walletUseCase) {
        this.walletUseCase = walletUseCase;
    }
    /**
     * GET /wallet/balance - Get current user balance
     */
    async getBalance(req, res, next) {
        try {
            const userId = req.body.userId || req.user?.id;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const balance = await this.walletUseCase.getBalance(userId);
            res.status(200).json({
                success: true,
                data: { balance }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * POST /wallet/top-up - Top up wallet balance
     */
    async topUp(req, res, next) {
        try {
            const userId = req.body.userId || req.user?.id;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const { amount, description } = req.body;
            if (!amount || amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
                return;
            }
            const dto = {
                amount: parseFloat(amount),
                description
            };
            const result = await this.walletUseCase.topUp(userId, dto);
            res.status(200).json({
                success: true,
                message: 'Wallet top-up successful',
                data: {
                    balance: result.balance,
                    transaction: result.transaction
                }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * GET /wallet - Get wallet info (balance + transactions)
     */
    async getWalletInfo(req, res, next) {
        try {
            const userId = req.body.userId || req.user?.id;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const walletInfo = await this.walletUseCase.getWalletInfo(userId);
            res.status(200).json({
                success: true,
                data: walletInfo
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * GET /wallet/transactions - Get transaction history
     */
    async getTransactions(req, res, next) {
        try {
            const userId = req.body.userId || req.user?.id;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const transactions = await this.walletUseCase.getTransactionHistory(userId);
            res.status(200).json({
                success: true,
                data: transactions
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}
//# sourceMappingURL=WalletController.js.map