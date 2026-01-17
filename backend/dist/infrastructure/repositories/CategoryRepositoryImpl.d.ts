import { Category, CreateCategoryDTO, UpdateCategoryDTO, CategoryResponse } from '../../domain/entities/Category';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
export declare class CategoryRepositoryImpl implements CategoryRepository {
    findById(id: string): Promise<Category | null>;
    findAll(): Promise<Category[]>;
    findActive(): Promise<Category[]>;
    create(dto: CreateCategoryDTO): Promise<Category>;
    update(id: string, data: UpdateCategoryDTO): Promise<Category>;
    delete(id: string): Promise<boolean>;
    toResponse(category: Category): CategoryResponse;
    private mapRowToCategory;
}
export declare const categoryRepository: CategoryRepositoryImpl;
//# sourceMappingURL=CategoryRepositoryImpl.d.ts.map