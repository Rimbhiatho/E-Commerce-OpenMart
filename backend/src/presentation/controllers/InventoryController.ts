import { Request, Response, NextFunction } from 'express';
import { InventoryUseCase, InventoryReport } from '../../domain/useCases/InventoryUseCase';

export class InventoryController {
  constructor(private inventoryUseCase: InventoryUseCase) {}

  async getInventoryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report: InventoryReport = await this.inventoryUseCase.getInventoryReport();
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getLowStockProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
      const products = await this.inventoryUseCase.getLowStockProducts(threshold);
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getOutOfStockProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await this.inventoryUseCase.getOutOfStockProducts();
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async addStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      const quantity = parseInt(req.body.quantity);
      const product = await this.inventoryUseCase.addStock(productId, quantity);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async removeStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      const quantity = parseInt(req.body.quantity);
      const product = await this.inventoryUseCase.removeStock(productId, quantity);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async setStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      const quantity = parseInt(req.body.quantity);
      const product = await this.inventoryUseCase.setStock(productId, quantity);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTotalInventoryValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalValue = await this.inventoryUseCase.getTotalInventoryValue();
      res.status(200).json({
        success: true,
        data: { totalValue }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getStockCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stockCount = await this.inventoryUseCase.getStockCount();
      res.status(200).json({
        success: true,
        data: { stockCount }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

