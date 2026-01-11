import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const registerValidation: ValidationChain[];
export declare const loginValidation: ValidationChain[];
export declare const createProductValidation: ValidationChain[];
export declare const updateProductValidation: ValidationChain[];
export declare const createCategoryValidation: ValidationChain[];
export declare const updateCategoryValidation: ValidationChain[];
export declare const createOrderValidation: ValidationChain[];
export declare const updateOrderStatusValidation: ValidationChain[];
export declare const updatePaymentStatusValidation: ValidationChain[];
export declare const updateStockValidation: ValidationChain[];
//# sourceMappingURL=validation.d.ts.map