import { User, CreateUserDTO, UserResponse } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
export declare class UserRepositoryImpl implements UserRepository {
    private db;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(dto: CreateUserDTO): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<boolean>;
    toResponse(user: User): UserResponse;
    private mapRowToUser;
}
export declare const userRepository: UserRepositoryImpl;
//# sourceMappingURL=UserRepositoryImpl.d.ts.map