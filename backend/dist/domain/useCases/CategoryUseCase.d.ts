import { CategoryRepository } from '../repositories/CategoryRepository';
import { CreateCategoryDTO, UpdateCategoryDTO, Category } from '../entities/Category';
export declare class CategoryUseCase {
    private categoryRepository;
    constructor(categoryRepository: CategoryRepository);
    getAllCategories(): Promise<Category[]>;
    getActiveCategories(): Promise<Category[]>;
    getCategoryById(id: string): Promise<Category | null>;
    createCategory(dto: CreateCategoryDTO): Promise<Category>;
    updateCategory(id: string, dto: UpdateCategoryDTO): Promise<Category>;
    deleteCategory(id: string): Promise<boolean>;
}
//# sourceMappingURL=CategoryUseCase.d.ts.map