import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { createProductValidation, updateProductValidation, handleValidationErrors } from '../middleware/validation';
export const setupProductRoutes = (productController, jwtSecret) => {
    const router = Router();
    // Public routes
    router.get('/', (req, res, next) => productController.getAllProducts(req, res, next));
    router.get('/active', (req, res, next) => productController.getActiveProducts(req, res, next));
    router.get('/search', (req, res, next) => productController.searchProducts(req, res, next));
    router.get('/category/:categoryId', (req, res, next) => productController.getProductsByCategory(req, res, next));
    router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));
    // Protected routes (admin only)
    router.post('/', authMiddleware(jwtSecret), adminOnly, createProductValidation, handleValidationErrors, (req, res, next) => productController.createProduct(req, res, next));
    router.put('/:id', authMiddleware(jwtSecret), adminOnly, updateProductValidation, handleValidationErrors, (req, res, next) => productController.updateProduct(req, res, next));
    router.put('/:id/stock', authMiddleware(jwtSecret), adminOnly, (req, res, next) => productController.updateStock(req, res, next));
    router.delete('/:id', authMiddleware(jwtSecret), adminOnly, (req, res, next) => productController.deleteProduct(req, res, next));
    return router;
};
//# sourceMappingURL=productRoutes.js.map