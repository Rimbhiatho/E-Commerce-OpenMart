import { Request, Response, NextFunction } from 'express';
import { WalletUseCase } from '../../domain/useCases/WalletUseCase';
import { TopUpDTO } from '../../domain/entities/User';

export class WalletController {
  constructor(private walletUseCase: WalletUseCase) {}

  /**
   * GET /wallet/balance - Get current user balance
   */
  async getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req as any).user?.id;
      
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /wallet/top-up - Top up wallet balance
   */
  async topUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req as any).user?.id;
      
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

      const dto: TopUpDTO = {
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /wallet - Get wallet info (balance + transactions)
   */
  async getWalletInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req as any).user?.id;
      
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /wallet/transactions - Get transaction history
   */
  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req as any).user?.id;
      
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

