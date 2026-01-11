import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
export class ProductRepositoryImpl {
    constructor() {
        this.db = getDatabase();
    }
    async findById(id) {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.get(`SELECT p.*, c.name as categoryName 
         FROM products p 
         LEFT JOIN categories c ON p.categoryId = c.id 
         WHERE p.id = ?`, [id], (err, row) => {
                if (err)
                    reject(err);
                else {
                    if (row) {
                        resolve(this.mapRowToProduct(row));
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }
    async findAll(filter) {
        const database = await this.db;
        let query = `SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.categoryId = c.id WHERE 1=1`;
        const params = [];
        if (filter?.categoryId) {
            query += ' AND p.categoryId = ?';
            params.push(filter.categoryId);
        }
        if (filter?.minPrice !== undefined) {
            query += ' AND p.price >= ?';
            params.push(filter.minPrice);
        }
        if (filter?.maxPrice !== undefined) {
            query += ' AND p.price <= ?';
            params.push(filter.maxPrice);
        }
        if (filter?.isActive !== undefined) {
            query += ' AND p.isActive = ?';
            params.push(filter.isActive ? 1 : 0);
        }
        if (filter?.search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${filter.search}%`, `%${filter.search}%`);
        }
        query += ' ORDER BY p.name ASC';
        return new Promise((resolve, reject) => {
            database.all(query, params, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToProduct(row)));
                }
            });
        });
    }
    async findByCategory(categoryId) {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.all(`SELECT p.*, c.name as categoryName 
         FROM products p 
         LEFT JOIN categories c ON p.categoryId = c.id 
         WHERE p.categoryId = ? 
         ORDER BY p.name ASC`, [categoryId], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToProduct(row)));
                }
            });
        });
    }
    async create(dto) {
        const database = await this.db;
        const id = uuidv4();
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            database.run(`INSERT INTO products (id, name, description, price, stock, categoryId, imageUrl, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, dto.name, dto.description, dto.price, dto.stock, dto.categoryId, dto.imageUrl, 1, now, now], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve({
                        id,
                        name: dto.name,
                        description: dto.description,
                        price: dto.price,
                        stock: dto.stock,
                        categoryId: dto.categoryId,
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
        if (data.price !== undefined) {
            updates.push('price = ?');
            values.push(data.price);
        }
        if (data.stock !== undefined) {
            updates.push('stock = ?');
            values.push(data.stock);
        }
        if (data.categoryId !== undefined) {
            updates.push('categoryId = ?');
            values.push(data.categoryId);
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
            database.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values, (err) => {
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
            database.run('DELETE FROM products WHERE id = ?', [id], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(true);
                }
            });
        });
    }
    async updateStock(id, quantity) {
        const database = await this.db;
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            database.run('UPDATE products SET stock = ?, updatedAt = ? WHERE id = ?', [quantity, now, id], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(this.findById(id));
                }
            });
        });
    }
    toResponse(product) {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId,
            categoryName: product.categoryName || '',
            imageUrl: product.imageUrl,
            isActive: product.isActive,
            createdAt: product.createdAt
        };
    }
    mapRowToProduct(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description || '',
            price: row.price,
            stock: row.stock,
            categoryId: row.categoryId,
            imageUrl: row.imageUrl || '',
            isActive: row.isActive === 1,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            categoryName: row.categoryName
        };
    }
}
export const productRepository = new ProductRepositoryImpl();
//# sourceMappingURL=ProductRepositoryImpl.js.map