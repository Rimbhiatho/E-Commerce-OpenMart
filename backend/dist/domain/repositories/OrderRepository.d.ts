import { Order, CreateOrderDTO, UpdateOrderStatusDTO, UpdatePaymentStatusDTO, OrderFilter, OrderResponse, OrderStatus } from '../entities/Order';
export interface OrderRepository {
    findById(id: string): Promise<Order | null>;
    findAll(filter?: OrderFilter): Promise<Order[]>;
    findByUser(userId: string): Promise<Order[]>;
    findByStatus(status: OrderStatus): Promise<Order[]>;
    create(dto: CreateOrderDTO): Promise<Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<Order>;
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDTO): Promise<Order>;
    delete(id: string): Promise<boolean>;
    toResponse(order: Order): OrderResponse;
}
//# sourceMappingURL=OrderRepository.d.ts.map