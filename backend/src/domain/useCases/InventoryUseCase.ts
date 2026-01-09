import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../entities/Product';

export interface InventoryReport {
  totalProducts: number;
  totalStock: number;
  lowStockItems: Product[];
  outOfStockItems: Product[];
  totalValue: number;
}

export class InventoryUseCase {
  constructor(private productRepository: ProductRepository) {}

  async getInventoryReport(): Promise<InventoryReport> {
    const products = await this.productRepository.findAll();
    
    const lowStockItems: Product[] = [];
    const outOfStockItems: Product[] = [];
    let totalStock = 0;
    let totalValue = 0;

    for (const product of products) {
      totalStock += product.stock;
      totalValue += product.price * product.stock;

      if (product.stock === 0) {
        outOfStockItems.push(product);
      } else if (product.stock <= 10) {
        lowStockItems.push(product);
      }
    }

    return {
      totalProducts: products.length,
      totalStock,
      lowStockItems,
      outOfStockItems,
      totalValue
    };
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const products = await this.productRepository.findAll();
    return products.filter(p => p.stock > 0 && p.stock <= threshold);
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    const products = await this.productRepository.findAll();
    return products.filter(p => p.stock === 0);
  }

  async addStock(productId: string, quantity: number): Promise<Product> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    return this.productRepository.updateStock(productId, quantity);
  }

  async removeStock(productId: string, quantity: number): Promise<Product> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    return this.productRepository.updateStock(productId, -quantity);
  }

  async setStock(productId: string, quantity: number): Promise<Product> {
    if (quantity < 0) {
      throw new Error('Stock cannot be negative');
    }
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    const difference = quantity - product.stock;
    return this.productRepository.updateStock(productId, difference);
  }

  async getTotalInventoryValue(): Promise<number> {
    const products = await this.productRepository.findAll();
    return products.reduce((total, product) => total + (product.price * product.stock), 0);
  }

  async getStockCount(): Promise<number> {
    const products = await this.productRepository.findAll();
    return products.reduce((total, product) => total + product.stock, 0);
  }
}

