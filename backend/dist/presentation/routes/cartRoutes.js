import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
export const setupCartRoutes = (cartController, jwtSecret) => {
    const router = Router();
    // All cart routes require authentication
    router.use(authMiddleware(jwtSecret));
    // Get cart items for authenticated user
    router.get('/cart', (req, res, next) => cartController.getCart(req, res, next));
    // Add item to cart
    router.post('/cart/items', (req, res, next) => cartController.addToCart(req, res, next));
    // Update quantity of a cart item
    router.put('/cart/items/:productId', (req, res, next) => cartController.updateQuantity(req, res, next));
    // Remove item from cart
    router.delete('/cart/items/:productId', (req, res, next) => cartController.removeFromCart(req, res, next));
    // Clear entire cart
    router.delete('/cart', (req, res, next) => cartController.clearCart(req, res, next));
    return router;
};
//# sourceMappingURL=cartRoutes.js.map