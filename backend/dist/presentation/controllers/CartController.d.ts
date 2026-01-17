import { Request, Response, NextFunction } from 'express';
import { CartRepositoryImpl } from '../../infrastructure/repositories/CartRepositoryImpl';
export declare class CartController {
    private cartRepository;
    constructor(cartRepository: CartRepositoryImpl);
    getCart(req: Request, res: Response, next: NextFunction): Promise<void>;
    addToCart(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateQuantity(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void>;
    clearCart(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=CartController.d.ts.map