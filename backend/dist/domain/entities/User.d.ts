export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'customer' | 'admin';
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
    createdAt: Date;
}
export interface CreateUserDTO {
    email: string;
    password: string;
    name: string;
    role?: 'customer' | 'admin';
    balance?: number;
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: UserResponse;
    token: string;
}
export interface WalletTransaction {
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    createdAt: Date;
}
export interface TopUpDTO {
    amount: number;
    description?: string;
}
export interface WalletResponse {
    balance: number;
    transactions: WalletTransaction[];
}
export interface BalanceUpdateDTO {
    amount: number;
    description?: string;
}
//# sourceMappingURL=User.d.ts.map