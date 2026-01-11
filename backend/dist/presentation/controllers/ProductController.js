export class ProductController {
    constructor(productUseCase) {
        this.productUseCase = productUseCase;
    }
    async getAllProducts(req, res, next) {
        try {
            const filter = {
                categoryId: req.query.categoryId,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
                search: req.query.search
            };
            const products = await this.productUseCase.getAllProducts(filter);
            res.status(200).json({
                success: true,
                data: products
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getProductById(req, res, next) {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getProductsByCategory(req, res, next) {
        try {
            const products = await this.productUseCase.getProductsByCategory(req.params.categoryId);
            res.status(200).json({
                success: true,
                data: products
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async createProduct(req, res, next) {
        try {
            const dto = {
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateProduct(req, res, next) {
        try {
            const dto = req.body;
            const product = await this.productUseCase.updateProduct(req.params.id, dto);
            res.status(200).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const result = await this.productUseCase.deleteProduct(req.params.id);
            res.status(200).json({
                success: result,
                message: result ? 'Product deleted successfully' : 'Product not found'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateStock(req, res, next) {
        try {
            const quantity = parseInt(req.body.quantity);
            const product = await this.productUseCase.updateStock(req.params.id, quantity);
            res.status(200).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async searchProducts(req, res, next) {
        try {
            const searchTerm = req.query.q;
            const products = await this.productUseCase.searchProducts(searchTerm);
            res.status(200).json({
                success: true,
                data: products
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getActiveProducts(req, res, next) {
        try {
            const products = await this.productUseCase.getActiveProducts();
            res.status(200).json({
                success: true,
                data: products
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
//# sourceMappingURL=ProductController.js.map