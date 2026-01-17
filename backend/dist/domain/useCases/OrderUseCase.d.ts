import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { CreateOrderDTO, UpdateOrderStatusDTO, UpdatePaymentStatusDTO, OrderFilter, Order, OrderStatus } from '../entities/Order';
export declare class OrderUseCase {
    private orderRepository;
    private productRepository;
    private userRepository;
    private walletRepository;
    constructor(orderRepository: OrderRepository, productRepository: ProductRepository, userRepository: UserRepository, walletRepository: WalletRepository);
    createOrder(dto: CreateOrderDTO): Promise<Order>;
    getAllOrders(filter?: OrderFilter): Promise<Order[]>;
    getOrderById(id: string): Promise<Order | null>;
    getOrdersByUser(userId: string): Promise<Order[]>;
    updateOrderStatus(id: string, dto: UpdateOrderStatusDTO): Promise<Order>;
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDTO): Promise<Order>;
    cancelOrder(id: string): Promise<Order>;
    deleteOrder(id: string): Promise<boolean>;
    getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
}
//# sourceMappingURL=OrderUseCase.d.ts.map