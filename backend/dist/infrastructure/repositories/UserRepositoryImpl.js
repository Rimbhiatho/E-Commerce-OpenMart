import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
export class UserRepositoryImpl {
    async findById(id) {
        const db = await getDatabase();
        const row = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        return row ? this.mapRowToUser(row) : null;
    }
    async findByEmail(email) {
        const db = await getDatabase();
        const row = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        return row ? this.mapRowToUser(row) : null;
    }
    async findAll() {
        const db = await getDatabase();
        const rows = await db.all('SELECT * FROM users ORDER BY createdAt DESC');
        return rows.map((row) => this.mapRowToUser(row));
    }
    async create(dto) {
        const db = await getDatabase();
        const id = uuidv4();
        const now = new Date().toISOString();
        const balance = dto.balance ?? 0;
        await db.run(`INSERT INTO users (id, email, password, name, role, balance, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, dto.email, dto.password, dto.name, dto.role || 'customer', balance, now, now]);
        return {
            id,
            email: dto.email,
            password: dto.password,
            name: dto.name,
            role: dto.role || 'customer',
            balance,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
    }
    async update(id, data) {
        const db = await getDatabase();
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
            return (await this.findById(id));
        }
        updates.push('updatedAt = ?');
        values.push(now);
        values.push(id);
        await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        return (await this.findById(id));
    }
    async delete(id) {
        const db = await getDatabase();
        await db.run('DELETE FROM users WHERE id = ?', [id]);
        return true;
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
            balance: row.balance || 0,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }
}
export const userRepository = new UserRepositoryImpl();
//# sourceMappingURL=UserRepositoryImpl.js.map