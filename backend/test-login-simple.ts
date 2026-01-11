import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function testLogin() {
  const dbPath = path.resolve(process.cwd(), 'data', 'openmart.db');
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const admin = await db.get("SELECT * FROM users WHERE email = ?", ['admin@openmart.com']);
  
  if (admin) {
    console.log('✅ Admin user found in database:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
  } else {
    console.log('❌ Admin user not found!');
  }

  await db.close();
}

testLogin();

