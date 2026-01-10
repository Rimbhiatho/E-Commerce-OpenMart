import { Router, Request, Response, NextFunction } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { createOrderValidation, updateOrderStatusValidation, updatePaymentStatusValidation, handleValidationErrors } from '../middleware/validation';

export const setupOrderRoutes = (orderController: OrderController, jwtSecret: string): Router => {
  const router = Router();

  // User routes (authenticated)
  router.get(
    '/my-orders',
    authMiddleware(jwtSecret),
    (req: AuthRequest, res: Response, next: NextFunction) => {
      req.params.userId = req.user!.id;
      orderController.getOrdersByUser(req, res, next);
    }
  );

  router.post(
    '/',
    authMiddleware(jwtSecret),
    createOrderValidation,
    handleValidationErrors,
    (req: AuthRequest, res: Response, next: NextFunction) => {
      req.body.userId = req.user!.id;
      orderController.createOrder(req, res, next);
    }
  );

  // Admin routes
  router.get(
    '/',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: Request, res: Response, next: NextFunction) => orderController.getAllOrders(req, res, next)
  );

  router.get(
    '/status/:status',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: AuthRequest, res: Response, next: NextFunction) => orderController.getOrdersByStatus(req, res, next)
  );

  router.get(
    '/:id',
    authMiddleware(jwtSecret),
    (req: AuthRequest, res: Response, next: NextFunction) => orderController.getOrderById(req, res, next)
  );

  router.put(
    '/:id/status',
    authMiddleware(jwtSecret),
    adminOnly,
    updateOrderStatusValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => orderController.updateOrderStatus(req, res, next)
  );

  router.put(
    '/:id/payment',
    authMiddleware(jwtSecret),
    adminOnly,
    updatePaymentStatusValidation,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => orderController.updatePaymentStatus(req, res, next)
  );

  router.post(
    '/:id/cancel',
    authMiddleware(jwtSecret),
    (req: AuthRequest, res: Response, next: NextFunction) => {
      req.body.userId = req.user!.id;
      orderController.cancelOrder(req, res, next);
    }
  );

  router.delete(
    '/:id',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: AuthRequest, res: Response, next: NextFunction) => orderController.deleteOrder(req, res, next)
  );

  return router;
};
