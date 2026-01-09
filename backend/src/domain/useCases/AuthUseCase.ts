import { UserRepository } from '../repositories/UserRepository';
import { CreateUserDTO, LoginDTO, AuthResponse, User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class AuthUseCase {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string = '24h'
  ) {}

  async register(dto: CreateUserDTO): Promise<AuthResponse> {
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

    const token = this.generateToken(user);
    return {
      user: this.userRepository.toResponse(user),
      token
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
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

  async getProfile(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.userRepository.update(userId, data);
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.userRepository.delete(userId);
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  verifyToken(token: string): { id: string; email: string; role: string } {
    return jwt.verify(token, this.jwtSecret) as { id: string; email: string; role: string };
  }
}

