import { Request, Response, NextFunction } from 'express';
import { OrderUseCase } from '../../domain/useCases/OrderUseCase';
export declare class OrderController {
    private orderUseCase;
    constructor(orderUseCase: OrderUseCase);
    createOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrderById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrdersByUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    updatePaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrdersByStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=OrderController.d.ts.map