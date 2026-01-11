import { User, CreateUserDTO, UserResponse } from '../entities/User';
export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(dto: CreateUserDTO): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<boolean>;
    toResponse(user: User): UserResponse;
}
//# sourceMappingURL=UserRepository.d.ts.map