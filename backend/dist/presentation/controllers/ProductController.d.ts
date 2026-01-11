import { Request, Response, NextFunction } from 'express';
import { ProductUseCase } from '../../domain/useCases/ProductUseCase';
export declare class ProductController {
    private productUseCase;
    constructor(productUseCase: ProductUseCase);
    getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    createProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStock(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActiveProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ProductController.d.ts.map