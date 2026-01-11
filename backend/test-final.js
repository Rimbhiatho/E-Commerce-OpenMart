const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, headers = {}, timeout = 5000) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const startTime = Date.now();
    
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
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({ 
          status: res.statusCode, 
          body, 
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (e) => {
      const duration = Date.now() - startTime;
      resolve({ status: 0, body: '', error: e.message, duration });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({ status: 0, body: '', error: 'timeout', duration });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 API ENDPOINT TEST - Individual Tests\n');
  console.log('='.repeat(60));

  let token = null;
  let tests = [];
  let passed = 0;
  let failed = 0;

  // 1. Health Check
  console.log('\n📍 TEST 1: Health Check');
  console.log('-'.repeat(40));
  let r = await request('GET', '/health');
  console.log(`   GET /health`);
  console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
  console.log(`   Result: ${r.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  tests.push({ name: 'GET /health', ...r, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 2. Login
  console.log('\n📍 TEST 2: Auth Login');
  console.log('-'.repeat(40));
  r = await request('POST', '/api/auth/login', {}, 10000);
  console.log(`   POST /api/auth/login`);
  console.log(`   Body: ${JSON.stringify({ email: 'admin@openmart.com', password: 'admin123' })}`);
  console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
  if (r.status === 200) {
    try {
      const data = JSON.parse(r.body);
      token = data.data?.token || data.token;
      console.log(`   Token: ${token?.substring(0, 30)}...`);
      console.log(`   Result: ✅ PASS`);
      tests.push({ name: 'POST /api/auth/login', ...r, ok: true });
      passed++;
    } catch(e) {
      console.log(`   Result: ❌ FAIL (parse error)`);
      tests.push({ name: 'POST /api/auth/login', ...r, ok: false });
      failed++;
    }
  } else {
    console.log(`   Result: ❌ FAIL`);
    tests.push({ name: 'POST /api/auth/login', ...r, ok: false });
    failed++;
  }

  // 3. Get Profile (with auth)
  console.log('\n📍 TEST 3: Get Profile (Protected)');
  console.log('-'.repeat(40));
  if (token) {
    r = await request('GET', '/api/auth/profile', { 'Authorization': `Bearer ${token}` });
    console.log(`   GET /api/auth/profile`);
    console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
    console.log(`   Result: ${r.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (r.body && r.body.length < 200) console.log(`   Response: ${r.body.substring(0, 100)}`);
    tests.push({ name: 'GET /api/auth/profile', ...r, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    console.log(`   Skipped - no token`);
    failed++;
  }

  // 4. Get Users (with auth)
  console.log('\n📍 TEST 4: Get Users (Protected, Admin Only)');
  console.log('-'.repeat(40));
  if (token) {
    r = await request('GET', '/api/auth/users', { 'Authorization': `Bearer ${token}` });
    console.log(`   GET /api/auth/users`);
    console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
    console.log(`   Result: ${r.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (r.body && r.body.length < 200) console.log(`   Response: ${r.body.substring(0, 100)}`);
    tests.push({ name: 'GET /api/auth/users', ...r, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    console.log(`   Skipped - no token`);
    failed++;
  }

  // 5. Categories
  console.log('\n📍 TEST 5: Categories');
  console.log('-'.repeat(40));
  r = await request('GET', '/api/categories');
  console.log(`   GET /api/categories`);
  console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
  console.log(`   Result: ${r.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  tests.push({ name: 'GET /api/categories', ...r, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 6. Products
  console.log('\n📍 TEST 6: Products');
  console.log('-'.repeat(40));
  r = await request('GET', '/api/products');
  console.log(`   GET /api/products`);
  console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
  console.log(`   Result: ${r.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  tests.push({ name: 'GET /api/products', ...r, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 7. Orders
  console.log('\n📍 TEST 7: Orders (Protected)');
  console.log('-'.repeat(40));
  if (token) {
    r = await request('GET', '/api/orders', { 'Authorization': `Bearer ${token}` });
    console.log(`   GET /api/orders`);
    console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
    console.log(`   Result: ${r.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    tests.push({ name: 'GET /api/orders', ...r, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    console.log(`   Skipped - no token`);
    failed++;
  }

  // 8. Inventory
  console.log('\n📍 TEST 8: Inventory (Protected)');
  console.log('-'.repeat(40));
  if (token) {
    r = await request('GET', '/api/inventory/report', { 'Authorization': `Bearer ${token}` });
    console.log(`   GET /api/inventory/report`);
    console.log(`   Status: ${r.status} | Time: ${r.duration}ms`);
    console.log(`   Result: ${r.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    tests.push({ name: 'GET /api/inventory/report', ...r, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    console.log(`   Skipped - no token`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total Tests: ${tests.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  // Return results for programmatic use
  return { tests, passed, failed, total: tests.length };
}

runTests().then(results => {
  console.log('\n🎉 Test run completed!');
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

