import { createApp } from './app';
import { initializeDatabase } from './infrastructure/database/database';
const port = process.env.PORT || 3000;
async function startServer() {
    try {
        console.log('🚀 Starting server...');
        // Initialize database
        console.log('📦 Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialized successfully');
        // Create and start Express app
        const app = createApp();
        app.listen(port, () => {
            console.log(`\n🛡️  Server is running on http://localhost:${port}`);
            console.log(`📋 API endpoints:`);
            console.log(`   - Auth:        http://localhost:${port}/api/auth`);
            console.log(`   - Products:    http://localhost:${port}/api/products`);
            console.log(`   - Categories:  http://localhost:${port}/api/categories`);
            console.log(`   - Orders:      http://localhost:${port}/api/orders`);
            console.log(`   - Inventory:   http://localhost:${port}/api/inventory`);
            console.log(`   - Health:      http://localhost:${port}/health`);
            console.log('\n');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=main.js.map