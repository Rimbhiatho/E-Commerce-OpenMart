import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { updateStockValidation, handleValidationErrors } from '../middleware/validation';
export const setupInventoryRoutes = (inventoryController, jwtSecret) => {
    const router = Router();
    // All inventory routes require admin authentication
    router.use(authMiddleware(jwtSecret));
    router.use(adminOnly);
    router.get('/report', (req, res, next) => inventoryController.getInventoryReport(req, res, next));
    router.get('/low-stock', (req, res, next) => inventoryController.getLowStockProducts(req, res, next));
    router.get('/out-of-stock', (req, res, next) => inventoryController.getOutOfStockProducts(req, res, next));
    router.get('/value', (req, res, next) => inventoryController.getTotalInventoryValue(req, res, next));
    router.get('/count', (req, res, next) => inventoryController.getStockCount(req, res, next));
    router.post('/:id/add', updateStockValidation, handleValidationErrors, (req, res, next) => inventoryController.addStock(req, res, next));
    router.post('/:id/remove', updateStockValidation, handleValidationErrors, (req, res, next) => inventoryController.removeStock(req, res, next));
    router.put('/:id/set', updateStockValidation, handleValidationErrors, (req, res, next) => inventoryController.setStock(req, res, next));
    return router;
};
//# sourceMappingURL=inventoryRoutes.js.map