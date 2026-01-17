import { CartItem, CartItemInput } from '../../domain/entities/Cart';
export declare class CartRepositoryImpl {
    private db;
    private getDb;
    getCartByUserId(userId: string): Promise<CartItem[]>;
    addToCart(input: CartItemInput): Promise<CartItem>;
    updateQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | null>;
    removeFromCart(userId: string, productId: string): Promise<boolean>;
    clearCart(userId: string): Promise<boolean>;
    getItemCount(userId: string): Promise<number>;
    getTotalPrice(userId: string): Promise<number>;
}
export declare const cartRepository: CartRepositoryImpl;
//# sourceMappingURL=CartRepositoryImpl.d.ts.map