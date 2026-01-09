import { Category, CreateCategoryDTO, UpdateCategoryDTO, CategoryResponse } from '../entities/Category';

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findActive(): Promise<Category[]>;
  create(dto: CreateCategoryDTO): Promise<Category>;
  update(id: string, data: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<boolean>;
  toResponse(category: Category): CategoryResponse;
}

