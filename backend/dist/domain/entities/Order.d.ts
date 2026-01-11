export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: string;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export interface OrderResponse {
    id: string;
    userId: string;
    userName: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: string;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    notes?: string;
    createdAt: Date;
}
export interface CreateOrderDTO {
    userId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddress: string;
    paymentMethod: string;
    notes?: string;
    totalAmount?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
}
export interface UpdateOrderStatusDTO {
    status: OrderStatus;
}
export interface UpdatePaymentStatusDTO {
    paymentStatus: PaymentStatus;
}
export interface OrderFilter {
    userId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
}
//# sourceMappingURL=Order.d.ts.map