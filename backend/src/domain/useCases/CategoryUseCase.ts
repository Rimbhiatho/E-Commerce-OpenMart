import { CategoryRepository } from '../repositories/CategoryRepository';
import { CreateCategoryDTO, UpdateCategoryDTO, Category } from '../entities/Category';

export class CategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getActiveCategories(): Promise<Category[]> {
    return this.categoryRepository.findActive();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async createCategory(dto: CreateCategoryDTO): Promise<Category> {
    return this.categoryRepository.create(dto);
  }

  async updateCategory(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return this.categoryRepository.update(id, dto);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return this.categoryRepository.delete(id);
  }
}

