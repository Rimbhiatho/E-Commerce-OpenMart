import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDatabase, initializeDatabase, closeDatabase } from './database';

const seedData = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await initializeDatabase();
    const db = getDatabase();

    // Check if data already exists
    const existingUsers = await new Promise<number>((resolve, reject) => {
      db!.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });

    if (existingUsers > 0) {
      console.log('✅ Database already seeded. Skipping...');
      await closeDatabase();
      return;
    }

    // Seed Categories
    console.log('📁 Seeding categories...');
    
    const categories = [
      {
        id: uuidv4(),
        name: 'Lifestyle',
        description: 'Fashion, accessories, and everyday essentials',
        imageUrl: 'https://example.com/images/lifestyle.jpg',
        isActive: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Technology',
        description: 'Gadgets, electronics, and tech accessories',
        imageUrl: 'https://example.com/images/technology.jpg',
        isActive: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const category of categories) {
      await new Promise<void>((resolve, reject) => {
        db!.run(
          `INSERT INTO categories (id, name, description, imageUrl, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [category.id, category.name, category.description, category.imageUrl, category.isActive, category.createdAt, category.updatedAt],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log(`✅ ${categories.length} categories seeded`);

    // Seed Admin User
    console.log('👤 Seeding admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: uuidv4(),
      email: 'admin@openmart.com',
      password: hashedPassword,
      name: 'Admin OpenMart',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await new Promise<void>((resolve, reject) => {
      db!.run(
        `INSERT INTO users (id, email, password, name, role, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [adminUser.id, adminUser.email, adminUser.password, adminUser.name, adminUser.role, adminUser.createdAt, adminUser.updatedAt],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log('✅ Admin user seeded (email: admin@openmart.com, password: admin123)');

    // Seed Products
    console.log('📦 Seeding products...');
    
    const products = [
      // Lifestyle Products
      {
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality cotton t-shirt, comfortable and durable',
        price: 29.99,
        stock: 100,
        categoryId: categories[0].id,
        imageUrl: 'https://example.com/images/tshirt.jpg',
        isActive: 1
      },
      {
        name: 'Leather Wallet',
        description: 'Genuine leather wallet with multiple card slots',
        price: 49.99,
        stock: 50,
        categoryId: categories[0].id,
        imageUrl: 'https://example.com/images/wallet.jpg',
        isActive: 1
      },
      {
        name: 'Sunglasses Classic',
        description: 'UV protection stylish sunglasses',
        price: 39.99,
        stock: 75,
        categoryId: categories[0].id,
        imageUrl: 'https://example.com/images/sunglasses.jpg',
        isActive: 1
      },
      // Technology Products
      {
        name: 'Wireless Earbuds Pro',
        description: 'High-fidelity wireless earbuds with noise cancellation',
        price: 149.99,
        stock: 30,
        categoryId: categories[1].id,
        imageUrl: 'https://example.com/images/earbuds.jpg',
        isActive: 1
      },
      {
        name: 'Smart Watch Series X',
        description: 'Advanced smartwatch with health monitoring',
        price: 299.99,
        stock: 25,
        categoryId: categories[1].id,
        imageUrl: 'https://example.com/images/smartwatch.jpg',
        isActive: 1
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: 'High capacity power bank with fast charging',
        price: 59.99,
        stock: 80,
        categoryId: categories[1].id,
        imageUrl: 'https://example.com/images/powerbank.jpg',
        isActive: 1
      },
      {
        name: 'Mechanical Keyboard RGB',
        description: 'Gaming mechanical keyboard with RGB lighting',
        price: 89.99,
        stock: 40,
        categoryId: categories[1].id,
        imageUrl: 'https://example.com/images/keyboard.jpg',
        isActive: 1
      },
      {
        name: 'Wireless Mouse Ergonomic',
        description: 'Ergonomic wireless mouse for comfortable use',
        price: 34.99,
        stock: 60,
        categoryId: categories[1].id,
        imageUrl: 'https://example.com/images/mouse.jpg',
        isActive: 1
      }
    ];

    for (const product of products) {
      const productId = uuidv4();
      await new Promise<void>((resolve, reject) => {
        db!.run(
          `INSERT INTO products (id, name, description, price, stock, categoryId, imageUrl, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            product.name,
            product.description,
            product.price,
            product.stock,
            product.categoryId,
            product.imageUrl,
            product.isActive,
            new Date().toISOString(),
            new Date().toISOString()
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log(`✅ ${products.length} products seeded`);

    console.log('🎉 Database seeding completed successfully!');
    await closeDatabase();
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if executed directly
seedData().then(() => {
  console.log('Seed process finished');
  process.exit(0);
});

export { seedData };

