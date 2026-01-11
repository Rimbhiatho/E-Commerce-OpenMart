export class ProductUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async getAllProducts(filter) {
        return this.productRepository.findAll(filter);
    }
    async getProductById(id) {
        return this.productRepository.findById(id);
    }
    async getProductsByCategory(categoryId) {
        return this.productRepository.findByCategory(categoryId);
    }
    async createProduct(dto) {
        if (dto.price < 0) {
            throw new Error('Price cannot be negative');
        }
        if (dto.stock < 0) {
            throw new Error('Stock cannot be negative');
        }
        return this.productRepository.create(dto);
    }
    async updateProduct(id, dto) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        if (dto.price !== undefined && dto.price < 0) {
            throw new Error('Price cannot be negative');
        }
        if (dto.stock !== undefined && dto.stock < 0) {
            throw new Error('Stock cannot be negative');
        }
        return this.productRepository.update(id, dto);
    }
    async deleteProduct(id) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        return this.productRepository.delete(id);
    }
    async updateStock(id, quantity) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        const newStock = product.stock + quantity;
        if (newStock < 0) {
            throw new Error('Insufficient stock');
        }
        return this.productRepository.updateStock(id, quantity);
    }
    async searchProducts(searchTerm) {
        return this.productRepository.findAll({ search: searchTerm });
    }
    async getActiveProducts() {
        return this.productRepository.findAll({ isActive: true });
    }
}
//# sourceMappingURL=ProductUseCase.js.map