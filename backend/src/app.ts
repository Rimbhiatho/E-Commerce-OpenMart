import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import { setupAuthRoutes } from './presentation/routes/authRoutes';
import { setupProductRoutes } from './presentation/routes/productRoutes';
import { setupCategoryRoutes } from './presentation/routes/categoryRoutes';
import { setupOrderRoutes } from './presentation/routes/orderRoutes';
import { setupInventoryRoutes } from './presentation/routes/inventoryRoutes';

// Import controllers
import { AuthController } from './presentation/controllers/AuthController';
import { ProductController } from './presentation/controllers/ProductController';
import { CategoryController } from './presentation/controllers/CategoryController';
import { OrderController } from './presentation/controllers/OrderController';
import { InventoryController } from './presentation/controllers/InventoryController';

// Import use cases
import { AuthUseCase } from './domain/useCases/AuthUseCase';
import { ProductUseCase } from './domain/useCases/ProductUseCase';
import { CategoryUseCase } from './domain/useCases/CategoryUseCase';
import { OrderUseCase } from './domain/useCases/OrderUseCase';
import { InventoryUseCase } from './domain/useCases/InventoryUseCase';

// Import repositories
import { userRepository } from './infrastructure/repositories/UserRepositoryImpl';
import { productRepository } from './infrastructure/repositories/ProductRepositoryImpl';
import { categoryRepository } from './infrastructure/repositories/CategoryRepositoryImpl';
import { orderRepository } from './infrastructure/repositories/OrderRepositoryImpl';

dotenv.config();

export function createApp(): Application {
  const app = express();
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  // Port diambil di main.ts, tapi bisa didefinisikan default di sini jika perlu

  // Middleware Global
  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize use cases
  const authUseCase = new AuthUseCase(userRepository, jwtSecret);
  const productUseCase = new ProductUseCase(productRepository);
  const categoryUseCase = new CategoryUseCase(categoryRepository);
  const orderUseCase = new OrderUseCase(orderRepository, productRepository, userRepository);
  const inventoryUseCase = new InventoryUseCase(productRepository);

  // Initialize controllers
  const authController = new AuthController(authUseCase);
  const productController = new ProductController(productUseCase);
  const categoryController = new CategoryController(categoryUseCase);
  const orderController = new OrderController(orderUseCase);
  const inventoryController = new InventoryController(inventoryUseCase);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- [START] DEBUGGING MIDDLEWARE (CCTV) ---
  // Kode ini akan mencatat setiap request yang masuk ke terminal
  app.use((req, res, next) => {
    console.log(`[DEBUG LOG] Method: ${req.method} | URL: ${req.url}`);
    next(); // Lanjut ke route berikutnya
  });
  // --- [END] DEBUGGING MIDDLEWARE ---

  // API routes
  app.use('/api/auth', setupAuthRoutes(authController, jwtSecret));
  app.use('/api/products', setupProductRoutes(productController, jwtSecret));
  app.use('/api/categories', setupCategoryRoutes(categoryController, jwtSecret));
  app.use('/api/orders', setupOrderRoutes(orderController, jwtSecret));
  app.use('/api/inventory', setupInventoryRoutes(inventoryController, jwtSecret));

  // 404 handler (Jika route tidak ditemukan di atas)
  app.use((req: Request, res: Response) => {
    console.log(`[DEBUG LOG] Route Not Found: ${req.url}`); // Tambahan log untuk 404
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });

  return app;
}