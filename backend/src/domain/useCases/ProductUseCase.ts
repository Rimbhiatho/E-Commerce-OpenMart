import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductDTO, UpdateProductDTO, ProductFilter, Product } from '../entities/Product';

export class ProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async getAllProducts(filter?: ProductFilter): Promise<Product[]> {
    return this.productRepository.findAll(filter);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.findByCategory(categoryId);
  }

  async createProduct(dto: CreateProductDTO): Promise<Product> {
    if (dto.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (dto.stock < 0) {
      throw new Error('Stock cannot be negative');
    }
    return this.productRepository.create(dto);
  }

  async updateProduct(id: string, dto: UpdateProductDTO): Promise<Product> {
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

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return this.productRepository.delete(id);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
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

  async searchProducts(searchTerm: string): Promise<Product[]> {
    return this.productRepository.findAll({ search: searchTerm });
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.productRepository.findAll({ isActive: true });
  }
}

