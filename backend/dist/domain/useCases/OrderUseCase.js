import { randomUUID } from 'crypto';
export class OrderUseCase {
    constructor(orderRepository, productRepository, userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    async createOrder(dto) {
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new Error('User not found');
        }
        const orderItems = [];
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
            await this.productRepository.updateStock(product.id, -item.quantity);
        }
        const order = await this.orderRepository.create({
            userId: dto.userId,
            items: orderItems,
            totalAmount,
            status: 'pending',
            shippingAddress: dto.shippingAddress,
            paymentMethod: dto.paymentMethod,
            paymentStatus: 'pending',
            notes: dto.notes
        });
        return order;
    }
    async getAllOrders(filter) {
        return this.orderRepository.findAll(filter);
    }
    async getOrderById(id) {
        return this.orderRepository.findById(id);
    }
    async getOrdersByUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return this.orderRepository.findByUser(userId);
    }
    async updateOrderStatus(id, dto) {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new Error('Order not found');
        }
        const validTransitions = {
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
        if (dto.status === 'cancelled' && order.status !== 'pending') {
            for (const item of order.items) {
                await this.productRepository.updateStock(item.productId, item.quantity);
            }
        }
        return this.orderRepository.updateStatus(id, dto);
    }
    async updatePaymentStatus(id, dto) {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new Error('Order not found');
        }
        return this.orderRepository.updatePaymentStatus(id, dto);
    }
    async cancelOrder(id) {
        return this.updateOrderStatus(id, { status: 'cancelled' });
    }
    async deleteOrder(id) {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new Error('Order not found');
        }
        return this.orderRepository.delete(id);
    }
    async getOrdersByStatus(status) {
        return this.orderRepository.findByStatus(status);
    }
}
//# sourceMappingURL=OrderUseCase.js.map