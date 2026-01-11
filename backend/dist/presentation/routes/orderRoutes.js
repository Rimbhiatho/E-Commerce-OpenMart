import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { createOrderValidation, updateOrderStatusValidation, updatePaymentStatusValidation, handleValidationErrors } from '../middleware/validation';
export const setupOrderRoutes = (orderController, jwtSecret) => {
    const router = Router();
    // User routes (authenticated)
    router.get('/my-orders', authMiddleware(jwtSecret), (req, res, next) => {
        req.params.userId = req.user.id;
        orderController.getOrdersByUser(req, res, next);
    });
    router.post('/', authMiddleware(jwtSecret), createOrderValidation, handleValidationErrors, (req, res, next) => {
        req.body.userId = req.user.id;
        orderController.createOrder(req, res, next);
    });
    // Admin routes
    router.get('/', authMiddleware(jwtSecret), adminOnly, (req, res, next) => orderController.getAllOrders(req, res, next));
    router.get('/status/:status', authMiddleware(jwtSecret), adminOnly, (req, res, next) => orderController.getOrdersByStatus(req, res, next));
    router.get('/:id', authMiddleware(jwtSecret), (req, res, next) => orderController.getOrderById(req, res, next));
    router.put('/:id/status', authMiddleware(jwtSecret), adminOnly, updateOrderStatusValidation, handleValidationErrors, (req, res, next) => orderController.updateOrderStatus(req, res, next));
    router.put('/:id/payment', authMiddleware(jwtSecret), adminOnly, updatePaymentStatusValidation, handleValidationErrors, (req, res, next) => orderController.updatePaymentStatus(req, res, next));
    router.post('/:id/cancel', authMiddleware(jwtSecret), (req, res, next) => {
        req.body.userId = req.user.id;
        orderController.cancelOrder(req, res, next);
    });
    router.delete('/:id', authMiddleware(jwtSecret), adminOnly, (req, res, next) => orderController.deleteOrder(req, res, next));
    return router;
};
//# sourceMappingURL=orderRoutes.js.map