import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
export class ProductRepositoryImpl {
    async findById(id) {
        const db = await getDatabase();
        const row = await db.get(`SELECT p.*, c.name as categoryName 
       FROM products p 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE p.id = ?`, [id]);
        return row ? this.mapRowToProduct(row) : null;
    }
    async findAll(filter) {
        const db = await getDatabase();
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
        const rows = await db.all(query, params);
        return rows.map((row) => this.mapRowToProduct(row));
    }
    async findByCategory(categoryId) {
        const db = await getDatabase();
        const rows = await db.all(`SELECT p.*, c.name as categoryName 
       FROM products p 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE p.categoryId = ? 
       ORDER BY p.name ASC`, [categoryId]);
        return rows.map((row) => this.mapRowToProduct(row));
    }
    async create(dto) {
        const db = await getDatabase();
        const id = uuidv4();
        const now = new Date().toISOString();
        await db.run(`INSERT INTO products (id, name, description, price, stock, categoryId, imageUrl, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, dto.name, dto.description, dto.price, dto.stock, dto.categoryId, dto.imageUrl, 1, now, now]);
        return {
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
        };
    }
    async update(id, data) {
        const db = await getDatabase();
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
            return (await this.findById(id));
        }
        updates.push('updatedAt = ?');
        values.push(now);
        values.push(id);
        await db.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
        return (await this.findById(id));
    }
    async delete(id) {
        const db = await getDatabase();
        await db.run('DELETE FROM products WHERE id = ?', [id]);
        return true;
    }
    async updateStock(id, quantity) {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.run('UPDATE products SET stock = stock + ?, updatedAt = ? WHERE id = ?', [quantity, now, id]);
        return (await this.findById(id));
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