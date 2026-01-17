const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function updateAllUsersBalance() {
  console.log('💰 Starting balance update for all users...');

  let db;
  try {
    // Connect to database (using process.cwd() like in database.ts)
    const dbPath = path.resolve(process.cwd(), 'data', 'openmart.db');
    console.log(`📂 Connecting to database at: ${dbPath}`);
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    await db.configure('busyTimeout', 5000);
    console.log('✅ Database connected');

    // Get current user count
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    console.log(`📊 Found ${userCount.count} users in database`);

    // Update ALL users to have 100 juta balance
    const now = new Date().toISOString();
    const result = await db.run(
      'UPDATE users SET balance = ?, updatedAt = ?',
      [100000000, now]
    );

    console.log(`✅ Successfully updated balance for all users to 100 juta (Rp 100,000,000)`);
    console.log(`📝 Total users updated: ${userCount.count}`);

    // Verify the update
    const balances = await db.all("SELECT id, email, name, balance FROM users");
    console.log('\n📋 Current user balances:');
    for (const user of balances) {
      console.log(`   - ${user.email} (${user.name}): Rp ${parseFloat(user.balance).toLocaleString('id-ID')}`);
    }

  } catch (error) {
    console.error('❌ Error updating user balances:', error);
  } finally {
    if (db) {
      await db.close();
      console.log('\n🔒 Database connection closed');
    }
  }
}

// Run the update
updateAllUsersBalance();

