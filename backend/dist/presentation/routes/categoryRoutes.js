import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { createCategoryValidation, updateCategoryValidation, handleValidationErrors } from '../middleware/validation';
export const setupCategoryRoutes = (categoryController, jwtSecret) => {
    const router = Router();
    // Public routes
    router.get('/', (req, res, next) => categoryController.getAllCategories(req, res, next));
    router.get('/active', (req, res, next) => categoryController.getActiveCategories(req, res, next));
    router.get('/:id', (req, res, next) => categoryController.getCategoryById(req, res, next));
    // Protected routes (admin only)
    router.post('/', authMiddleware(jwtSecret), adminOnly, createCategoryValidation, handleValidationErrors, (req, res, next) => categoryController.createCategory(req, res, next));
    router.put('/:id', authMiddleware(jwtSecret), adminOnly, updateCategoryValidation, handleValidationErrors, (req, res, next) => categoryController.updateCategory(req, res, next));
    router.delete('/:id', authMiddleware(jwtSecret), adminOnly, (req, res, next) => categoryController.deleteCategory(req, res, next));
    return router;
};
//# sourceMappingURL=categoryRoutes.js.map