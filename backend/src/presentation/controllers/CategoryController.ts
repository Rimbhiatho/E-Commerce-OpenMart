import { Request, Response, NextFunction } from 'express';
import { CategoryUseCase } from '../../domain/useCases/CategoryUseCase';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../../domain/entities/Category';

export class CategoryController {
  constructor(private categoryUseCase: CategoryUseCase) {}

  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.categoryUseCase.getAllCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getActiveCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.categoryUseCase.getActiveCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await this.categoryUseCase.getCategoryById(req.params.id);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateCategoryDTO = {
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl
      };

      const category = await this.categoryUseCase.createCategory(dto);
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: UpdateCategoryDTO = req.body;
      const category = await this.categoryUseCase.updateCategory(req.params.id, dto);
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.categoryUseCase.deleteCategory(req.params.id);
      res.status(200).json({
        success: result,
        message: result ? 'Category deleted successfully' : 'Category not found'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

