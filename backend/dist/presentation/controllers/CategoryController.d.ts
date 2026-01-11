import { Request, Response, NextFunction } from 'express';
import { CategoryUseCase } from '../../domain/useCases/CategoryUseCase';
export declare class CategoryController {
    private categoryUseCase;
    constructor(categoryUseCase: CategoryUseCase);
    getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActiveCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=CategoryController.d.ts.map