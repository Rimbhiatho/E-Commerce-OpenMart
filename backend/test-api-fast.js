const http = require('http');

const BASE_URL = 'http://localhost:3000';
let token = null;

function request(method, path, data, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const opts = {
      hostname: url.hostname, port: url.port,
      path: url.pathname + url.search, method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  const results = [];
  
  // Health
  let r = await request('GET', '/health');
  results.push({ test: 'GET /health', status: r.status, ok: r.status === 200 });
  console.log(`GET /health: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  // Login
  r = await request('POST', '/api/auth/login', { email: 'admin@openmart.com', password: 'admin123' });
  results.push({ test: 'POST /api/auth/login', status: r.status, ok: r.status === 200 });
  console.log(`POST /api/auth/login: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    token = data.data?.token || data.token;
  }

  // Profile
  if (token) {
    r = await request('GET', '/api/auth/profile', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/auth/profile', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/auth/profile: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  // Users
  if (token) {
    r = await request('GET', '/api/auth/users', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/auth/users', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/auth/users: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  // Categories
  r = await request('GET', '/api/categories');
  results.push({ test: 'GET /api/categories', status: r.status, ok: r.status === 200 });
  console.log(`GET /api/categories: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  r = await request('GET', '/api/categories/active');
  results.push({ test: 'GET /api/categories/active', status: r.status, ok: r.status === 200 });
  console.log(`GET /api/categories/active: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  // Products
  r = await request('GET', '/api/products');
  results.push({ test: 'GET /api/products', status: r.status, ok: r.status === 200 });
  console.log(`GET /api/products: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  r = await request('GET', '/api/products/active');
  results.push({ test: 'GET /api/products/active', status: r.status, ok: r.status === 200 });
  console.log(`GET /api/products/active: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  r = await request('GET', '/api/products/search?q=laptop');
  results.push({ test: 'GET /api/products/search', status: r.status, ok: r.status === 200 });
  console.log(`GET /api/products/search: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

  // Orders
  if (token) {
    r = await request('GET', '/api/orders/my-orders', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/orders/my-orders', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/orders/my-orders: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

    r = await request('GET', '/api/orders', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/orders', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/orders: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  // Inventory
  if (token) {
    r = await request('GET', '/api/inventory/report', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/inventory/report', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/inventory/report: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

    r = await request('GET', '/api/inventory/low-stock', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/inventory/low-stock', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/inventory/low-stock: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

    r = await request('GET', '/api/inventory/out-of-stock', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/inventory/out-of-stock', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/inventory/out-of-stock: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

    r = await request('GET', '/api/inventory/value', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/inventory/value', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/inventory/value: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);

    r = await request('GET', '/api/inventory/count', null, { 'Authorization': `Bearer ${token}` });
    results.push({ test: 'GET /api/inventory/count', status: r.status, ok: r.status === 200 });
    console.log(`GET /api/inventory/count: ${r.status === 200 ? '✓ OK' : '✗ FAIL'} (${r.status})`);
  }

  // Summary
  const ok = results.filter(r => r.ok).length;
  const total = results.length;
  console.log(`\n📊 SUMMARY: ${ok}/${total} tests passed`);
  
  if (ok === total) {
    console.log('🎉 ALL API ENDPOINTS ARE WORKING CORRECTLY!\n');
  } else {
    console.log('⚠️  SOME ENDPOINTS NEED ATTENTION\n');
  }
}

test().catch(console.error);

