import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { 
  CreateOrderDTO, 
  UpdateOrderStatusDTO, 
  UpdatePaymentStatusDTO, 
  OrderFilter, 
  Order, 
  OrderStatus,
  OrderItem
} from '../entities/Order';
import { randomUUID } from 'crypto';

export class OrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private userRepository: UserRepository,
    private walletRepository: WalletRepository
  ) {}

  async createOrder(dto: CreateOrderDTO): Promise<Order> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate total amount first
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (!product.isActive) {
        throw new Error(`Product ${product.name} is not available`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      orderItems.push({
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });

      totalAmount += itemTotal;
    }

    // NEW: Validate user has sufficient balance
    const currentBalance = await this.walletRepository.getBalance(dto.userId);
    if (currentBalance < totalAmount) {
      throw new Error(`Insufficient Funds. Required: ${totalAmount}, Available: ${currentBalance}`);
    }

    // NEW: Deduct balance from wallet (start transaction)
    const paymentResult = await this.walletRepository.deduct(
      dto.userId,
      totalAmount,
      `Payment for order`
    );

    // Update product stock after successful payment
    for (const item of dto.items) {
      await this.productRepository.updateStock(item.productId, -item.quantity);
    }

    // Create order with payment info
    const order = await this.orderRepository.create({
      userId: dto.userId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      paymentStatus: 'paid', // Mark as paid since wallet was deducted
      notes: dto.notes ? `${dto.notes}\nWallet Transaction ID: ${paymentResult.transaction.id}` : `Wallet Transaction ID: ${paymentResult.transaction.id}`
    });

    return order;
  }

  async getAllOrders(filter?: OrderFilter): Promise<Order[]> {
    return this.orderRepository.findAll(filter);
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.orderRepository.findByUser(userId);
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDTO): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['refunded'],
      cancelled: [],
      refunded: []
    };

    if (!validTransitions[order.status].includes(dto.status)) {
      throw new Error(`Cannot transition from ${order.status} to ${dto.status}`);
    }

    // Handle stock restoration on cancellation (only for non-pending orders)
    if (dto.status === 'cancelled' && order.status !== 'pending') {
      for (const item of order.items) {
        await this.productRepository.updateStock(item.productId, item.quantity);
      }
    }

    // Handle refund to wallet when order is refunded
    if (dto.status === 'refunded' && order.status === 'delivered') {
      // Refund the amount back to user's wallet
      await this.walletRepository.topUp(order.userId, {
        amount: order.totalAmount,
        description: `Refund for order ${id}`
      });
    }

    return this.orderRepository.updateStatus(id, dto);
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDTO): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    return this.orderRepository.updatePaymentStatus(id, dto);
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, { status: 'cancelled' });
  }

  async deleteOrder(id: string): Promise<boolean> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return this.orderRepository.delete(id);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.findByStatus(status);
  }
}

