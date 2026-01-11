import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
export class OrderRepositoryImpl {
    constructor() {
        this.db = getDatabase();
    }
    async findById(id) {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.get(`SELECT o.*, u.name as userName 
         FROM orders o 
         LEFT JOIN users u ON o.userId = u.id 
         WHERE o.id = ?`, [id], (err, row) => {
                if (err)
                    reject(err);
                else {
                    if (row) {
                        resolve(this.mapRowToOrder(row));
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
        let query = `SELECT o.*, u.name as userName FROM orders o LEFT JOIN users u ON o.userId = u.id WHERE 1=1`;
        const params = [];
        if (filter?.userId) {
            query += ' AND o.userId = ?';
            params.push(filter.userId);
        }
        if (filter?.status) {
            query += ' AND o.status = ?';
            params.push(filter.status);
        }
        if (filter?.paymentStatus) {
            query += ' AND o.paymentStatus = ?';
            params.push(filter.paymentStatus);
        }
        if (filter?.startDate) {
            query += ' AND o.createdAt >= ?';
            params.push(filter.startDate.toISOString());
        }
        if (filter?.endDate) {
            query += ' AND o.createdAt <= ?';
            params.push(filter.endDate.toISOString());
        }
        query += ' ORDER BY o.createdAt DESC';
        return new Promise((resolve, reject) => {
            database.all(query, params, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToOrder(row)));
                }
            });
        });
    }
    async findByUser(userId) {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.all(`SELECT o.*, u.name as userName 
         FROM orders o 
         LEFT JOIN users u ON o.userId = u.id 
         WHERE o.userId = ? 
         ORDER BY o.createdAt DESC`, [userId], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToOrder(row)));
                }
            });
        });
    }
    async findByStatus(status) {
        const database = await this.db;
        return new Promise((resolve, reject) => {
            database.all(`SELECT o.*, u.name as userName 
         FROM orders o 
         LEFT JOIN users u ON o.userId = u.id 
         WHERE o.status = ? 
         ORDER BY o.createdAt DESC`, [status], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows.map(row => this.mapRowToOrder(row)));
                }
            });
        });
    }
    async create(dto) {
        const database = await this.db;
        const id = uuidv4();
        const now = new Date().toISOString();
        const items = JSON.stringify(dto.items);
        // Convert DTO items to OrderItem format
        const orderItems = dto.items.map((item, index) => ({
            id: `item-${index}`,
            productId: item.productId,
            productName: '',
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0
        }));
        return new Promise((resolve, reject) => {
            database.run(`INSERT INTO orders (id, userId, items, totalAmount, status, shippingAddress, paymentMethod, paymentStatus, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                dto.userId,
                items,
                dto.totalAmount || 0,
                dto.status || 'pending',
                dto.shippingAddress,
                dto.paymentMethod,
                dto.paymentStatus || 'pending',
                dto.notes || null,
                now,
                now
            ], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve({
                        id,
                        userId: dto.userId,
                        items: orderItems,
                        totalAmount: dto.totalAmount || 0,
                        status: dto.status || 'pending',
                        shippingAddress: dto.shippingAddress,
                        paymentMethod: dto.paymentMethod,
                        paymentStatus: dto.paymentStatus || 'pending',
                        notes: dto.notes,
                        createdAt: new Date(now),
                        updatedAt: new Date(now)
                    });
                }
            });
        });
    }
    async updateStatus(id, dto) {
        const database = await this.db;
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            database.run('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?', [dto.status, now, id], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(this.findById(id));
                }
            });
        });
    }
    async updatePaymentStatus(id, dto) {
        const database = await this.db;
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            database.run('UPDATE orders SET paymentStatus = ?, updatedAt = ? WHERE id = ?', [dto.paymentStatus, now, id], (err) => {
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
            database.run('DELETE FROM orders WHERE id = ?', [id], (err) => {
                if (err)
                    reject(err);
                else {
                    resolve(true);
                }
            });
        });
    }
    toResponse(order) {
        return {
            id: order.id,
            userId: order.userId,
            userName: order.userName || '',
            items: order.items,
            totalAmount: order.totalAmount,
            status: order.status,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            notes: order.notes,
            createdAt: order.createdAt
        };
    }
    mapRowToOrder(row) {
        let items = [];
        try {
            const parsedItems = JSON.parse(row.items);
            items = parsedItems.map((item, index) => ({
                id: `item-${index}`,
                productId: item.productId,
                productName: '',
                quantity: item.quantity,
                unitPrice: 0,
                totalPrice: 0
            }));
        }
        catch (e) {
            items = [];
        }
        return {
            id: row.id,
            userId: row.userId,
            items: items,
            totalAmount: row.totalAmount,
            status: row.status,
            shippingAddress: row.shippingAddress,
            paymentMethod: row.paymentMethod,
            paymentStatus: row.paymentStatus,
            notes: row.notes || undefined,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            userName: row.userName
        };
    }
}
export const orderRepository = new OrderRepositoryImpl();
//# sourceMappingURL=OrderRepositoryImpl.js.map