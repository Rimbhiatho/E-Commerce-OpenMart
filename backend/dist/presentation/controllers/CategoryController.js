export class CategoryController {
    constructor(categoryUseCase) {
        this.categoryUseCase = categoryUseCase;
    }
    async getAllCategories(req, res, next) {
        try {
            const categories = await this.categoryUseCase.getAllCategories();
            res.status(200).json({
                success: true,
                data: categories
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getActiveCategories(req, res, next) {
        try {
            const categories = await this.categoryUseCase.getActiveCategories();
            res.status(200).json({
                success: true,
                data: categories
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getCategoryById(req, res, next) {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async createCategory(req, res, next) {
        try {
            const dto = {
                name: req.body.name,
                description: req.body.description,
                imageUrl: req.body.imageUrl
            };
            const category = await this.categoryUseCase.createCategory(dto);
            res.status(201).json({
                success: true,
                data: category
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateCategory(req, res, next) {
        try {
            const dto = req.body;
            const category = await this.categoryUseCase.updateCategory(req.params.id, dto);
            res.status(200).json({
                success: true,
                data: category
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async deleteCategory(req, res, next) {
        try {
            const result = await this.categoryUseCase.deleteCategory(req.params.id);
            res.status(200).json({
                success: result,
                message: result ? 'Category deleted successfully' : 'Category not found'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}
//# sourceMappingURL=CategoryController.js.map