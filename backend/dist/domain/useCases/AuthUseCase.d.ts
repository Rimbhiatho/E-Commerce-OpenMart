import { UserRepository } from '../repositories/UserRepository';
import { CreateUserDTO, LoginDTO, AuthResponse, User } from '../entities/User';
export declare class AuthUseCase {
    private userRepository;
    private jwtSecret;
    private jwtExpiresIn;
    constructor(userRepository: UserRepository, jwtSecret: string, jwtExpiresIn?: string);
    register(dto: CreateUserDTO): Promise<AuthResponse>;
    login(dto: LoginDTO): Promise<AuthResponse>;
    getProfile(userId: string): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    updateUser(userId: string, data: Partial<User>): Promise<User>;
    deleteUser(userId: string): Promise<boolean>;
    private generateToken;
    verifyToken(token: string): {
        id: string;
        email: string;
        role: string;
    };
}
//# sourceMappingURL=AuthUseCase.d.ts.map