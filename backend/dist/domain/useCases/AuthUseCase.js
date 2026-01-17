import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
export class AuthUseCase {
    constructor(userRepository, walletRepository, jwtSecret, jwtExpiresIn = '24h') {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.jwtSecret = jwtSecret;
        this.jwtExpiresIn = jwtExpiresIn;
    }
    async register(dto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.userRepository.create({
            ...dto,
            password: hashedPassword,
            role: dto.role || 'customer'
        });
        // Initialize wallet balance for new user
        await this.walletRepository.initializeBalance(user.id);
        const token = this.generateToken(user);
        return {
            user: this.userRepository.toResponse(user),
            token
        };
    }
    async login(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isValidPassword = await bcrypt.compare(dto.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        const token = this.generateToken(user);
        return {
            user: this.userRepository.toResponse(user),
            token
        };
    }
    async getProfile(userId) {
        return this.userRepository.findById(userId);
    }
    async getAllUsers() {
        return this.userRepository.findAll();
    }
    async updateUser(userId, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return this.userRepository.update(userId, data);
    }
    async deleteUser(userId) {
        return this.userRepository.delete(userId);
    }
    // --- BAGIAN YANG DIPERBAIKI ADA DI BAWAH INI ---
    generateToken(user) {
        return jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, this.jwtSecret, // 'as any' dihapus karena string valid untuk Secret
        {
            expiresIn: this.jwtExpiresIn
        } // <--- PERBAIKAN UTAMA: Casting ke tipe SignOptions
        );
    }
    verifyToken(token) {
        return jwt.verify(token, this.jwtSecret);
    }
}
//# sourceMappingURL=AuthUseCase.js.map