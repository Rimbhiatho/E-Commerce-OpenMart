import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
export class UserRepositoryImpl {
    constructor() {
        this.db = getDatabase();
    }
    async findById(id) {
        const db = await this.db;
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else {
                    if (row) {
                        resolve(this.mapRowToUser(row));
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }
    async findByEmail(email) {
        const db = await this.db;
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err)
                    reject(err);
                else {
                    if (row) {
                        resolve(this.mapRowToUser(row));
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }
    async findAll() {
        return new Promise(async (resolve, reject) => {
            (await this.db).all('SELECT * FROM users ORDER BY createdAt DESC', (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToUser(row)));
                }
            });
        });
    }
    async create(dto) {
        const db = await this.db;
        const id = uuidv4();
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, dto.email, dto.password, dto.name, dto.role || 'customer', now, now], (err) => {
                if (err)
                    reject(err);
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
            });
        });
    }
    async update(id, data) {
        const now = new Date().toISOString();
        const updates = [];
        const values = [];
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'createdAt') {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        });
        if (updates.length === 0) {
            return this.findById(id);
        }
        updates.push('updatedAt = ?');
        values.push(now);
        values.push(id);
        return new Promise(async (resolve, reject) => {
            (await this.db).run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values, (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(this.findById(id));
                }
            });
        });
    }
    async delete(id) {
        return new Promise(async (resolve, reject) => {
            (await this.db).run('DELETE FROM users WHERE id = ?', [id], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(true);
                }
            });
        });
    }
    toResponse(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt
        };
    }
    mapRowToUser(row) {
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
//# sourceMappingURL=UserRepositoryImpl.js.map