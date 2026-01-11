import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductDTO, UpdateProductDTO, ProductFilter, Product } from '../entities/Product';
export declare class ProductUseCase {
    private productRepository;
    constructor(productRepository: ProductRepository);
    getAllProducts(filter?: ProductFilter): Promise<Product[]>;
    getProductById(id: string): Promise<Product | null>;
    getProductsByCategory(categoryId: string): Promise<Product[]>;
    createProduct(dto: CreateProductDTO): Promise<Product>;
    updateProduct(id: string, dto: UpdateProductDTO): Promise<Product>;
    deleteProduct(id: string): Promise<boolean>;
    updateStock(id: string, quantity: number): Promise<Product>;
    searchProducts(searchTerm: string): Promise<Product[]>;
    getActiveProducts(): Promise<Product[]>;
}
//# sourceMappingURL=ProductUseCase.d.ts.map