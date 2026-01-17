import { Product, CreateProductDTO, UpdateProductDTO, ProductFilter, ProductResponse } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
export declare class ProductRepositoryImpl implements ProductRepository {
    findById(id: string): Promise<Product | null>;
    findAll(filter?: ProductFilter): Promise<Product[]>;
    findByCategory(categoryId: string): Promise<Product[]>;
    create(dto: CreateProductDTO): Promise<Product>;
    update(id: string, data: UpdateProductDTO): Promise<Product>;
    delete(id: string): Promise<boolean>;
    updateStock(id: string, quantity: number): Promise<Product>;
    toResponse(product: Product & {
        categoryName?: string;
    }): ProductResponse;
    private mapRowToProduct;
}
export declare const productRepository: ProductRepositoryImpl;
//# sourceMappingURL=ProductRepositoryImpl.d.ts.map