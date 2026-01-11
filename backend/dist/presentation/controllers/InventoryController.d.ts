import { Request, Response, NextFunction } from 'express';
import { InventoryUseCase } from '../../domain/useCases/InventoryUseCase';
export declare class InventoryController {
    private inventoryUseCase;
    constructor(inventoryUseCase: InventoryUseCase);
    getInventoryReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLowStockProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOutOfStockProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    addStock(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeStock(req: Request, res: Response, next: NextFunction): Promise<void>;
    setStock(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTotalInventoryValue(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStockCount(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=InventoryController.d.ts.map