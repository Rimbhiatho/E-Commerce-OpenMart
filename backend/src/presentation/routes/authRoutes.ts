import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { registerValidation, loginValidation, handleValidationErrors } from '../middleware/validation';

export const setupAuthRoutes = (authController: AuthController, jwtSecret: string): Router => {
  const router = Router();

  // Public routes
  router.post(
    '/register',
    registerValidation,
    handleValidationErrors,
    (req, res, next) => authController.register(req, res, next)
  );

  router.post(
    '/login',
    loginValidation,
    handleValidationErrors,
    (req, res, next) => authController.login(req, res, next)
  );

  // Protected routes
  router.get(
    '/profile',
    authMiddleware(jwtSecret),
    (req: AuthRequest, res, next) => authController.getProfile(req, res, next)
  );

  router.get(
    '/users',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: AuthRequest, res, next) => authController.getAllUsers(req, res, next)
  );

  router.put(
    '/users/:id',
    authMiddleware(jwtSecret),
    (req: AuthRequest, res, next) => authController.updateUser(req, res, next)
  );

  router.delete(
    '/users/:id',
    authMiddleware(jwtSecret),
    adminOnly,
    (req: AuthRequest, res, next) => authController.deleteUser(req, res, next)
  );

  return router;
};
