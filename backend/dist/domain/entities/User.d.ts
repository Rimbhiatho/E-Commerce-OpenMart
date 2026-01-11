export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'customer' | 'admin';
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
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: UserResponse;
    token: string;
}
//# sourceMappingURL=User.d.ts.map