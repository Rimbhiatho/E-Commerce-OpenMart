import { User, CreateUserDTO, UserResponse } from '../entities/User';
import { UserRepository } from '../domain/repositories/UserRepository';
import { getDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export class UserRepositoryImpl implements UserRepository {
  private db = getDatabase();

  async findById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) reject(err);
          else {
            if (row) {
              resolve(this.mapRowToUser(row));
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row: any) => {
          if (err) reject(err);
          else {
            if (row) {
              resolve(this.mapRowToUser(row));
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  async findAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users ORDER BY createdAt DESC',
        (err, rows: any[]) => {
          if (err) reject(err);
          else {
            resolve(rows.map(row => this.mapRowToUser(row)));
          }
        }
      );
    });
  }

  async create(dto: CreateUserDTO): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, dto.email, dto.password, dto.name, dto.role || 'customer', now, now],
        (err) => {
          if (err) reject(err);
          else {
            resolve({
              id,
              email: dto.email,
              password: dto.password,
              name: dto.name,
              role: dto.role || 'customer',
              createdAt: new Date(now),
              updatedAt: new Date(now)
            });
          }
        }
      );
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return this.findById(id) as Promise<User>;
    }

    updates.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          else {
            resolve(this.findById(id) as Promise<User>);
          }
        }
      );
    });
  }

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else {
            resolve(true);
          }
        }
      );
    });
  }

  toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      role: row.role,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}

export const userRepository = new UserRepositoryImpl();

