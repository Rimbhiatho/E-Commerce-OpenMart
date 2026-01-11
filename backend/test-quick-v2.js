const http = require('http');

const BASE_URL = 'http://localhost:3000';
let token = null;

function request(method, path, data, headers, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const opts = {
      hostname: url.hostname, 
      port: url.port,
      path: url.pathname + url.search, 
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', (e) => resolve({ status: 0, body: '', error: e.message }));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({ status: 0, body: '', error: 'timeout' });
    });
    
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('🧪 QUICK API ENDPOINT TEST\n');
  console.log('='.repeat(50));
  
  // Health
  console.log('\n1. Testing Health Check...');
  let r = await request('GET', '/health', null, {}, 3000);
  console.log(`   GET /health: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  // Login
  console.log('\n2. Testing Auth Login...');
  r = await request('POST', '/api/auth/login', { email: 'admin@openmart.com', password: 'admin123' }, {}, 3000);
  console.log(`   POST /api/auth/login: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  if (r.status === 200) {
    try {
      const data = JSON.parse(r.body);
      token = data.data?.token || data.token;
      console.log(`   ✓ Token received: ${token?.substring(0, 20)}...`);
    } catch(e) {}
  }

  // Profile (requires auth)
  if (token) {
    console.log('\n3. Testing Auth Profile...');
    r = await request('GET', '/api/auth/profile', null, { 'Authorization': `Bearer ${token}` }, 3000);
    console.log(`   GET /api/auth/profile: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  // Users (requires auth)
  if (token) {
    console.log('\n4. Testing Users List...');
    r = await request('GET', '/api/auth/users', null, { 'Authorization': `Bearer ${token}` }, 3000);
    console.log(`   GET /api/auth/users: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  // Categories
  console.log('\n5. Testing Categories...');
  r = await request('GET', '/api/categories', null, {}, 3000);
  console.log(`   GET /api/categories: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  
  r = await request('GET', '/api/categories/active', null, {}, 3000);
  console.log(`   GET /api/categories/active: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  // Products
  console.log('\n6. Testing Products...');
  r = await request('GET', '/api/products', null, {}, 3000);
  console.log(`   GET /api/products: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  
  r = await request('GET', '/api/products/active', null, {}, 3000);
  console.log(`   GET /api/products/active: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  // Orders (requires auth)
  if (token) {
    console.log('\n7. Testing Orders...');
    r = await request('GET', '/api/orders/my-orders', null, { 'Authorization': `Bearer ${token}` }, 3000);
    console.log(`   GET /api/orders/my-orders: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
    
    r = await request('GET', '/api/orders', null, { 'Authorization': `Bearer ${token}` }, 3000);
    console.log(`   GET /api/orders: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  // Inventory (requires auth)
  if (token) {
    console.log('\n8. Testing Inventory...');
    r = await request('GET', '/api/inventory/report', null, { 'Authorization': `Bearer ${token}` }, 3000);
    console.log(`   GET /api/inventory/report: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
    
    r = await request('GET', '/api/inventory/low-stock', null, { 'Authorization': `Bearer ${token}` }, 3000);
    console.log(`   GET /api/inventory/low-stock: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Quick test completed!');
}

test().catch(console.error);

