import { Router, Request, Response, NextFunction } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { createCategoryValidation, updateCategoryValidation, handleValidationErrors } from '../middleware/validation';

export const setupCategoryRoutes = (categoryController: CategoryController, jwtSecret: string): Router => {
  const router = Router();

  // Public routes
  router.get(
    '/',
    (req: Request, res: Response, next: NextFunction) => categoryController.getAllCategories(req, res, next)
  );

  router.get(
    '/active',
    (req: Request, res: Response, next: NextFunction) => categoryController.getActiveCategories(req, res, next)
  );

  router.get(
    '/:id',
    (req: Request, res: Response, next: NextFunction) => categoryController.getCategoryById(req, res, next)
  );

  // Protected routes (admin only)
  router.post(
    '/',
    authMiddleware(jwtSecret),
    adminOnly,
    createCategoryValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => categoryController.createCategory(req, res, next)
  );

  router.put(
    '/:id',
    authMiddleware(jwtSecret),
    adminOnly,
    updateCategoryValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => categoryController.updateCategory(req, res, next)
  );

  router.delete(
    '/:id',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: AuthRequest, res: Response, next: NextFunction) => categoryController.deleteCategory(req, res, next)
  );

  return router;
};
