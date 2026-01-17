import { WalletRepository as WalletRepositoryInterface } from '../../domain/repositories/WalletRepository';
import { WalletTransaction, TopUpDTO } from '../../domain/entities/User';
export declare class WalletRepositoryImpl implements WalletRepositoryInterface {
    getBalance(userId: string): Promise<number>;
    topUp(userId: string, dto: TopUpDTO): Promise<{
        balance: number;
        transaction: WalletTransaction;
    }>;
    deduct(userId: string, amount: number, description: string): Promise<{
        balance: number;
        transaction: WalletTransaction;
    }>;
    getTransactionHistory(userId: string): Promise<WalletTransaction[]>;
    initializeBalance(userId: string): Promise<void>;
}
export declare const walletRepository: WalletRepositoryImpl;
//# sourceMappingURL=WalletRepositoryImpl.d.ts.map