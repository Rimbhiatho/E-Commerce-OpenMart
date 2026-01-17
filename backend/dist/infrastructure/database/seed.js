import { getDatabase, initializeDatabase, closeDatabase } from './database';
import { v4 as uuidv4 } from 'uuid'; // Pastikan Anda punya library uuid, jika tidak, lihat catatan di bawah
import bcrypt from 'bcryptjs'; // Pastikan Anda punya library bcryptjs, jika tidak, lihat catatan di bawah
const seedData = async () => {
    console.log('🌱 Starting database seeding...');
    try {
        // 1. Pastikan database initialized & dapatkan koneksinya
        await initializeDatabase();
        const db = await getDatabase(); // Mengambil instance db yang sudah connect
        // --- SEED USERS ---
        const adminEmail = 'admin@openmart.com';
        // Cek apakah admin sudah ada (pakai await langsung, tanpa callback)
        const existingAdmin = await db.get("SELECT * FROM users WHERE email = ?", [adminEmail]);
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const adminId = uuidv4();
            const now = new Date().toISOString();
            await db.run(`INSERT INTO users (id, email, password, name, role, balance, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [adminId, adminEmail, hashedPassword, 'Admin OpenMart', 'admin', 100000000, now, now]);
            console.log('✅ Admin user created with 100 juta wallet balance');
        }
        else {
            console.log('ℹ️ Admin user already exists, updating balance to 100 juta...');
            await db.run('UPDATE users SET balance = ?, updatedAt = ? WHERE email = ?', [100000000, new Date().toISOString(), adminEmail]);
        }
        // --- SEED CUSTOMER USER ---
        const customerEmail = 'customer@openmart.com';
        const existingCustomer = await db.get("SELECT * FROM users WHERE email = ?", [customerEmail]);
        if (!existingCustomer) {
            const hashedPassword = await bcrypt.hash('customer123', 10);
            const customerId = uuidv4();
            const now = new Date().toISOString();
            await db.run(`INSERT INTO users (id, email, password, name, role, balance, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [customerId, customerEmail, hashedPassword, 'Customer OpenMart', 'customer', 100000000, now, now]);
            console.log('✅ Customer user created with 100 juta wallet balance');
        }
        else {
            console.log('ℹ️ Customer user already exists, updating balance to 100 juta...');
            await db.run('UPDATE users SET balance = ?, updatedAt = ? WHERE email = ?', [100000000, new Date().toISOString(), customerEmail]);
        }
        // --- SEED CATEGORIES (Contoh) ---
        const categories = [
            { name: 'Electronics', description: 'Gadgets and devices' },
            { name: 'Clothing', description: 'Men and women fashion' },
            { name: 'Groceries', description: 'Daily needs' }
        ];
        for (const cat of categories) {
            const existingCat = await db.get("SELECT * FROM categories WHERE name = ?", [cat.name]);
            if (!existingCat) {
                const now = new Date().toISOString();
                await db.run(`INSERT INTO categories (id, name, description, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?)`, [uuidv4(), cat.name, cat.description, now, now]);
                console.log(`✅ Category '${cat.name}' created`);
            }
        }
        console.log('✅ Seeding completed successfully');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        await closeDatabase();
    }
};
// Jalankan fungsi seed
seedData();
//# sourceMappingURL=seed.js.map