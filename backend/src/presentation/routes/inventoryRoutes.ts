import { Router, Request, Response, NextFunction } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { updateStockValidation, handleValidationErrors } from '../middleware/validation';

export const setupInventoryRoutes = (inventoryController: InventoryController, jwtSecret: string): Router => {
  const router = Router();

  // All inventory routes require admin authentication
  router.use(authMiddleware(jwtSecret));
  router.use(adminOnly);

  router.get(
    '/report',
    (req: Request, res: Response, next: NextFunction) => inventoryController.getInventoryReport(req, res, next)
  );

  router.get(
    '/low-stock',
    (req: Request, res: Response, next: NextFunction) => inventoryController.getLowStockProducts(req, res, next)
  );

  router.get(
    '/out-of-stock',
    (req: Request, res: Response, next: NextFunction) => inventoryController.getOutOfStockProducts(req, res, next)
  );

  router.get(
    '/value',
    (req: Request, res: Response, next: NextFunction) => inventoryController.getTotalInventoryValue(req, res, next)
  );

  router.get(
    '/count',
    (req: Request, res: Response, next: NextFunction) => inventoryController.getStockCount(req, res, next)
  );

  router.post(
    '/:id/add',
    updateStockValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => inventoryController.addStock(req, res, next)
  );

  router.post(
    '/:id/remove',
    updateStockValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => inventoryController.removeStock(req, res, next)
  );

  router.put(
    '/:id/set',
    updateStockValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => inventoryController.setStock(req, res, next)
  );

  return router;
};
