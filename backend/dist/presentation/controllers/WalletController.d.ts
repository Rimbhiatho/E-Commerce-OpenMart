import { Request, Response, NextFunction } from 'express';
import { WalletUseCase } from '../../domain/useCases/WalletUseCase';
export declare class WalletController {
    private walletUseCase;
    constructor(walletUseCase: WalletUseCase);
    /**
     * GET /wallet/balance - Get current user balance
     */
    getBalance(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /wallet/top-up - Top up wallet balance
     */
    topUp(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /wallet - Get wallet info (balance + transactions)
     */
    getWalletInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /wallet/transactions - Get transaction history
     */
    getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=WalletController.d.ts.map