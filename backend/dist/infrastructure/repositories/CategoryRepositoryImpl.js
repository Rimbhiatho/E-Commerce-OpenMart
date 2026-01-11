import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
export class CategoryRepositoryImpl {
    constructor() {
        this.db = getDatabase();
    }
    async findById(id) {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else {
                    if (row) {
                        resolve(this.mapRowToCategory(row));
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }
    async findAll() {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.all('SELECT * FROM categories ORDER BY name ASC', (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToCategory(row)));
                }
            });
        });
    }
    async findActive() {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.all('SELECT * FROM categories WHERE isActive = 1 ORDER BY name ASC', (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToCategory(row)));
                }
            });
        });
    }
    async create(dto) {
        const database = await this.db;
        const id = uuidv4();
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            database.run(`INSERT INTO categories (id, name, description, imageUrl, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, dto.name, dto.description, dto.imageUrl, 1, now, now], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve({
                        id,
                        name: dto.name,
                        description: dto.description,
                        imageUrl: dto.imageUrl,
                        isActive: true,
                        createdAt: new Date(now),
                        updatedAt: new Date(now)
                    });
                }
            });
        });
    }
    async update(id, data) {
        const database = await this.db;
        const now = new Date().toISOString();
        const updates = [];
        const values = [];
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.imageUrl !== undefined) {
            updates.push('imageUrl = ?');
            values.push(data.imageUrl);
        }
        if (data.isActive !== undefined) {
            updates.push('isActive = ?');
            values.push(data.isActive ? 1 : 0);
        }
        if (updates.length === 0) {
            return this.findById(id);
        }
        updates.push('updatedAt = ?');
        values.push(now);
        values.push(id);
        return new Promise((resolve, reject) => {
            database.run(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values, (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(this.findById(id));
                }
            });
        });
    }
    async delete(id) {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.run('DELETE FROM categories WHERE id = ?', [id], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(true);
                }
            });
        });
    }
    toResponse(category) {
        return {
            id: category.id,
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl,
            isActive: category.isActive,
            createdAt: category.createdAt
        };
    }
    mapRowToCategory(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description || '',
            imageUrl: row.imageUrl || '',
            isActive: row.isActive === 1,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        };
    }
}
export const categoryRepository = new CategoryRepositoryImpl();
//# sourceMappingURL=CategoryRepositoryImpl.js.map