const http = require('http');

const BASE_URL = 'http://localhost:3000';
let token = null;

function request(method, path, headers = {}, timeout = 8000) {
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

async function runAllTests() {
  console.log('🧪 COMPREHENSIVE API ENDPOINT TEST\n');
  console.log('='.repeat(60));

  let tests = [];
  let passed = 0;
  let failed = 0;

  // 1. Login First
  console.log('\n📍 STEP 1: Authentication');
  console.log('-'.repeat(50));
  let r = await request('POST', '/api/auth/login', {}, 10000);
  if (r.status === 200) {
    try {
      const data = JSON.parse(r.body);
      token = data.data?.token || data.token;
      console.log(`✅ Login Successful`);
      console.log(`   Token: ${token?.substring(0, 40)}...`);
      tests.push({ name: 'POST /api/auth/login', status: r.status, ok: true });
      passed++;
    } catch(e) {
      console.log(`❌ Login Failed (parse error)`);
      tests.push({ name: 'POST /api/auth/login', status: r.status, ok: false });
      failed++;
    }
  } else {
    console.log(`❌ Login Failed: ${r.status}`);
    console.log(`   Response: ${r.body.substring(0, 200)}`);
    tests.push({ name: 'POST /api/auth/login', status: r.status, ok: false });
    failed++;
  }

  // 2. Health Check
  console.log('\n📍 TEST 1: Health Check');
  console.log('-'.repeat(50));
  r = await request('GET', '/health');
  console.log(`GET /health: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
  tests.push({ name: 'GET /health', status: r.status, duration: r.duration, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 3. Profile (Protected)
  console.log('\n📍 TEST 2: Get Profile (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/auth/profile', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/auth/profile: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    if (r.status === 200 && r.body) {
      try {
        const data = JSON.parse(r.body);
        console.log(`   User: ${data.data?.name || 'N/A'}`);
      } catch(e) {}
    }
    tests.push({ name: 'GET /api/auth/profile', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    console.log(`   Skipped - no token`);
    tests.push({ name: 'GET /api/auth/profile', status: 0, ok: false });
    failed++;
  }

  // 4. Users List (Protected, Admin)
  console.log('\n📍 TEST 3: Get Users (Protected, Admin)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/auth/users', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/auth/users: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    if (r.status === 200 && r.body) {
      try {
        const data = JSON.parse(r.body);
        console.log(`   Users count: ${data.data?.length || 0}`);
      } catch(e) {}
    }
    tests.push({ name: 'GET /api/auth/users', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/auth/users', status: 0, ok: false });
    failed++;
  }

  // 5. Categories
  console.log('\n📍 TEST 4: Categories');
  console.log('-'.repeat(50));
  r = await request('GET', '/api/categories');
  console.log(`GET /api/categories: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
  if (r.status === 200 && r.body) {
    try {
      const data = JSON.parse(r.body);
      console.log(`   Categories count: ${data.data?.length || 0}`);
    } catch(e) {}
  }
  tests.push({ name: 'GET /api/categories', status: r.status, duration: r.duration, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 6. Categories Active
  console.log('\n📍 TEST 5: Active Categories');
  console.log('-'.repeat(50));
  r = await request('GET', '/api/categories/active');
  console.log(`GET /api/categories/active: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
  tests.push({ name: 'GET /api/categories/active', status: r.status, duration: r.duration, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 7. Products
  console.log('\n📍 TEST 6: Products');
  console.log('-'.repeat(50));
  r = await request('GET', '/api/products');
  console.log(`GET /api/products: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
  if (r.status === 200 && r.body) {
    try {
      const data = JSON.parse(r.body);
      console.log(`   Products count: ${data.data?.length || 0}`);
    } catch(e) {}
  }
  tests.push({ name: 'GET /api/products', status: r.status, duration: r.duration, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 8. Products Active
  console.log('\n📍 TEST 7: Active Products');
  console.log('-'.repeat(50));
  r = await request('GET', '/api/products/active');
  console.log(`GET /api/products/active: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
  tests.push({ name: 'GET /api/products/active', status: r.status, duration: r.duration, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 9. Products Search
  console.log('\n📍 TEST 8: Product Search');
  console.log('-'.repeat(50));
  r = await request('GET', '/api/products/search?q=laptop');
  console.log(`GET /api/products/search?q=laptop: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
  tests.push({ name: 'GET /api/products/search', status: r.status, duration: r.duration, ok: r.status === 200 });
  if (r.status === 200) passed++; else failed++;

  // 10. My Orders
  console.log('\n📍 TEST 9: My Orders (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/orders/my-orders', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/orders/my-orders: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    tests.push({ name: 'GET /api/orders/my-orders', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/orders/my-orders', status: 0, ok: false });
    failed++;
  }

  // 11. All Orders
  console.log('\n📍 TEST 10: All Orders (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/orders', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/orders: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    tests.push({ name: 'GET /api/orders', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/orders', status: 0, ok: false });
    failed++;
  }

  // 12. Inventory Report
  console.log('\n📍 TEST 11: Inventory Report (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/inventory/report', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/inventory/report: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    tests.push({ name: 'GET /api/inventory/report', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/inventory/report', status: 0, ok: false });
    failed++;
  }

  // 13. Low Stock
  console.log('\n📍 TEST 12: Low Stock (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/inventory/low-stock', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/inventory/low-stock: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    tests.push({ name: 'GET /api/inventory/low-stock', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/inventory/low-stock', status: 0, ok: false });
    failed++;
  }

  // 14. Out of Stock
  console.log('\n📍 TEST 13: Out of Stock (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/inventory/out-of-stock', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/inventory/out-of-stock: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    tests.push({ name: 'GET /api/inventory/out-of-stock', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/inventory/out-of-stock', status: 0, ok: false });
    failed++;
  }

  // 15. Inventory Value
  console.log('\n📍 TEST 14: Inventory Value (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/inventory/value', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/inventory/value: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    tests.push({ name: 'GET /api/inventory/value', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/inventory/value', status: 0, ok: false });
    failed++;
  }

  // 16. Inventory Count
  console.log('\n📍 TEST 15: Inventory Count (Protected)');
  console.log('-'.repeat(50));
  if (token) {
    r = await request('GET', '/api/inventory/count', { 'Authorization': `Bearer ${token}` });
    console.log(`GET /api/inventory/count: ${r.status === 200 ? '✅' : '❌'} (${r.status}) | ${r.duration}ms`);
    tests.push({ name: 'GET /api/inventory/count', status: r.status, duration: r.duration, ok: r.status === 200 });
    if (r.status === 200) passed++; else failed++;
  } else {
    tests.push({ name: 'GET /api/inventory/count', status: 0, ok: false });
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total Tests: ${tests.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  // List failed tests
  const failedTests = tests.filter(t => !t.ok);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(t => {
      console.log(`   - ${t.name} (status: ${t.status})`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  if (passed === tests.length) {
    console.log('🎉 ALL TESTS PASSED! API IS FULLY FUNCTIONAL!');
  } else if (passed >= tests.length * 0.8) {
    console.log('✅ MOST TESTS PASSED - Minor issues detected');
  } else {
    console.log('⚠️  MULTIPLE TESTS FAILED - Needs attention');
  }
  console.log('='.repeat(60));

  return { tests, passed, failed, total: tests.length };
}

runAllTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

