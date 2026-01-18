import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';
export class OrderRepositoryImpl {
    async findById(id) {
        const db = await getDatabase();
        const row = await db.get(`SELECT o.*, u.name as userName 
       FROM orders o 
       LEFT JOIN users u ON o.userId = u.id 
       WHERE o.id = ?`, [id]);
        return row ? this.mapRowToOrder(row) : null;
    }
    async findAll(filter) {
        const db = await getDatabase();
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
        const rows = await db.all(query, params);
        return rows.map((row) => this.mapRowToOrder(row));
    }
    async findByUser(userId) {
        const db = await getDatabase();
        const rows = await db.all(`SELECT o.*, u.name as userName 
       FROM orders o 
       LEFT JOIN users u ON o.userId = u.id 
       WHERE o.userId = ? 
       ORDER BY o.createdAt DESC`, [userId]);
        return rows.map((row) => this.mapRowToOrder(row));
    }
    async findByStatus(status) {
        const db = await getDatabase();
        const rows = await db.all(`SELECT o.*, u.name as userName 
       FROM orders o 
       LEFT JOIN users u ON o.userId = u.id 
       WHERE o.status = ? 
       ORDER BY o.createdAt DESC`, [status]);
        return rows.map((row) => this.mapRowToOrder(row));
    }
    async create(dto) {
        const db = await getDatabase();
        const id = uuidv4();
        const now = new Date().toISOString();
        // Build order items using fields provided in DTO when available
        const orderItems = dto.items.map((item, index) => {
            const quantity = item.quantity ?? 1;
            const unitPrice = (item.unitPrice ?? item.price ?? 0);
            const productName = (item.productName ?? item.name ?? '');
            return {
                id: item.id ?? `item-${index}`,
                productId: item.productId,
                productName,
                quantity,
                unitPrice,
                totalPrice: (item.totalPrice ?? (unitPrice * quantity))
            };
        });
        const items = JSON.stringify(orderItems);
        await db.run(`INSERT INTO orders (id, userId, items, totalAmount, status, shippingAddress, paymentMethod, paymentStatus, notes, createdAt, updatedAt)
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
        ]);
        return {
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
        };
    }
    async updateStatus(id, dto) {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.run('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?', [dto.status, now, id]);
        return (await this.findById(id));
    }
    async updatePaymentStatus(id, dto) {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.run('UPDATE orders SET paymentStatus = ?, updatedAt = ? WHERE id = ?', [dto.paymentStatus, now, id]);
        return (await this.findById(id));
    }
    async delete(id) {
        const db = await getDatabase();
        await db.run('DELETE FROM orders WHERE id = ?', [id]);
        return true;
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
            items = parsedItems.map((item, index) => {
                const quantity = item.quantity ?? 1;
                const unitPrice = (item.unitPrice ?? item.price ?? 0);
                const productName = (item.productName ?? item.name ?? '');
                return {
                    id: item.id ?? `item-${index}`,
                    productId: item.productId,
                    productName,
                    quantity,
                    unitPrice,
                    totalPrice: (item.totalPrice ?? (unitPrice * quantity))
                };
            });
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