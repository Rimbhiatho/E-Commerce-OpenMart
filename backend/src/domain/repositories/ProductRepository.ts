import { Product, CreateProductDTO, UpdateProductDTO, ProductFilter, ProductResponse } from '../entities/Product';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(filter?: ProductFilter): Promise<Product[]>;
  findByCategory(categoryId: string): Promise<Product[]>;
  create(dto: CreateProductDTO): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product>;
  delete(id: string): Promise<boolean>;
  updateStock(id: string, quantity: number): Promise<Product>;
  toResponse(product: Product): ProductResponse;
}

