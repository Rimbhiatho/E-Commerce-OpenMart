export class CategoryUseCase {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async getAllCategories() {
        return this.categoryRepository.findAll();
    }
    async getActiveCategories() {
        return this.categoryRepository.findActive();
    }
    async getCategoryById(id) {
        return this.categoryRepository.findById(id);
    }
    async createCategory(dto) {
        return this.categoryRepository.create(dto);
    }
    async updateCategory(id, dto) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        return this.categoryRepository.update(id, dto);
    }
    async deleteCategory(id) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        return this.categoryRepository.delete(id);
    }
}
//# sourceMappingURL=CategoryUseCase.js.map