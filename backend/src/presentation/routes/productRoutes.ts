import { Router, Request, Response, NextFunction } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { createProductValidation, updateProductValidation, handleValidationErrors } from '../middleware/validation';

export const setupProductRoutes = (productController: ProductController, jwtSecret: string): Router => {
  const router = Router();

  // Public routes
  router.get(
    '/',
    (req: Request, res: Response, next: NextFunction) => productController.getAllProducts(req, res, next)
  );

  router.get(
    '/active',
    (req: Request, res: Response, next: NextFunction) => productController.getActiveProducts(req, res, next)
  );

  router.get(
    '/search',
    (req: Request, res: Response, next: NextFunction) => productController.searchProducts(req, res, next)
  );

  router.get(
    '/category/:categoryId',
    (req: Request, res: Response, next: NextFunction) => productController.getProductsByCategory(req, res, next)
  );

  router.get(
    '/:id',
    (req: Request, res: Response, next: NextFunction) => productController.getProductById(req, res, next)
  );

  // Protected routes (admin only)
  router.post(
    '/',
    authMiddleware(jwtSecret),
    adminOnly,
    createProductValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => productController.createProduct(req, res, next)
  );

  router.put(
    '/:id',
    authMiddleware(jwtSecret),
    adminOnly,
    updateProductValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => productController.updateProduct(req, res, next)
  );

  router.put(
    '/:id/stock',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: AuthRequest, res: Response, next: NextFunction) => productController.updateStock(req, res, next)
  );

  router.delete(
    '/:id',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: AuthRequest, res: Response, next: NextFunction) => productController.deleteProduct(req, res, next)
  );

  return router;
};
