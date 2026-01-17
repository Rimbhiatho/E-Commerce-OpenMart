import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
export const setupWalletRoutes = (walletController, jwtSecret) => {
    const router = Router();
    // All wallet routes require authentication
    router.use(authMiddleware(jwtSecret));
    /**
     * GET /wallet/balance
     * Get current user's wallet balance
     */
    router.get('/balance', (req, res, next) => {
        req.body.userId = req.user.id;
        walletController.getBalance(req, res, next);
    });
    /**
     * POST /wallet/top-up
     * Top up wallet balance
     * Body: { amount: number, description?: string }
     */
    router.post('/top-up', (req, res, next) => {
        req.body.userId = req.user.id;
        walletController.topUp(req, res, next);
    });
    /**
     * GET /wallet
     * Get wallet info (balance + transaction history)
     */
    router.get('/', (req, res, next) => {
        req.body.userId = req.user.id;
        walletController.getWalletInfo(req, res, next);
    });
    /**
     * GET /wallet/transactions
     * Get transaction history
     */
    router.get('/transactions', (req, res, next) => {
        req.body.userId = req.user.id;
        walletController.getTransactions(req, res, next);
    });
    return router;
};
//# sourceMappingURL=walletRoutes.js.map