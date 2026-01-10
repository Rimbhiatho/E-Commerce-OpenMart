import { Request, Response, NextFunction } from 'express';
import { ProductUseCase } from '../../domain/useCases/ProductUseCase';
import { CreateProductDTO, UpdateProductDTO, ProductFilter } from '../../domain/entities/Product';

export class ProductController {
  constructor(private productUseCase: ProductUseCase) {}

  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: ProductFilter = {
        categoryId: req.query.categoryId as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string
      };

      const products = await this.productUseCase.getAllProducts(filter);
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productUseCase.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await this.productUseCase.getProductsByCategory(req.params.categoryId);
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateProductDTO = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        categoryId: req.body.categoryId,
        imageUrl: req.body.imageUrl
      };

      const product = await this.productUseCase.createProduct(dto);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: UpdateProductDTO = req.body;
      const product = await this.productUseCase.updateProduct(req.params.id, dto);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.productUseCase.deleteProduct(req.params.id);
      res.status(200).json({
        success: result,
        message: result ? 'Product deleted successfully' : 'Product not found'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quantity = parseInt(req.body.quantity);
      const product = await this.productUseCase.updateStock(req.params.id, quantity);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const products = await this.productUseCase.searchProducts(searchTerm);
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getActiveProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await this.productUseCase.getActiveProducts();
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

