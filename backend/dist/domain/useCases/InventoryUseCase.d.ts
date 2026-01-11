import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../entities/Product';
export interface InventoryReport {
    totalProducts: number;
    totalStock: number;
    lowStockItems: Product[];
    outOfStockItems: Product[];
    totalValue: number;
}
export declare class InventoryUseCase {
    private productRepository;
    constructor(productRepository: ProductRepository);
    getInventoryReport(): Promise<InventoryReport>;
    getLowStockProducts(threshold?: number): Promise<Product[]>;
    getOutOfStockProducts(): Promise<Product[]>;
    addStock(productId: string, quantity: number): Promise<Product>;
    removeStock(productId: string, quantity: number): Promise<Product>;
    setStock(productId: string, quantity: number): Promise<Product>;
    getTotalInventoryValue(): Promise<number>;
    getStockCount(): Promise<number>;
}
//# sourceMappingURL=InventoryUseCase.d.ts.map