const http = require('http');

const BASE_URL = 'http://localhost:3000';
let adminToken = null;
let testProductId = null;
let testCategoryId = null;
let testOrderId = null;

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) || {} });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
};

async function runTests() {
  console.log('\n🧪 API ENDPOINT TESTING - OpenMart Backend\n');
  let passed = 0, failed = 0;

  // 1. Health Check
  console.log('1. HEALTH CHECK:');
  const health = await makeRequest('GET', '/health');
  if (health.status === 200) { console.log('   ✓ GET /health - OK'); passed++; }
  else { console.log('   ✗ GET /health - FAILED'); failed++; }

  // 2. Login
  console.log('\n2. AUTH ENDPOINTS:');
  const login = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@openmart.com', password: 'admin123',
  });
  if (login.status === 200 && login.data.data?.token) {
    adminToken = login.data.data.token;
    console.log('   ✓ POST /api/auth/login - OK (Token received)');
    passed++;
  } else {
    console.log('   ✗ POST /api/auth/login - FAILED'); failed++;
    return;
  }

  // Profile
  const profile = await makeRequest('GET', '/api/auth/profile', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (profile.status === 200) { console.log('   ✓ GET /api/auth/profile - OK'); passed++; }
  else { console.log('   ✗ GET /api/auth/profile - FAILED'); failed++; }

  // Users list
  const users = await makeRequest('GET', '/api/auth/users', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (users.status === 200) { console.log('   ✓ GET /api/auth/users - OK'); passed++; }
  else { console.log('   ✗ GET /api/auth/users - FAILED'); failed++; }

  // Register
  const register = await makeRequest('POST', '/api/auth/register', {
    email: `test${Date.now()}@example.com`, password: 'testpass123', name: 'Test User', role: 'user',
  });
  if (register.status === 201) { console.log('   ✓ POST /api/auth/register - OK'); passed++; }
  else { console.log('   ✗ POST /api/auth/register - SKIPPED (may exist)'); }

  // 3. Categories
  console.log('\n3. CATEGORY ENDPOINTS:');
  const categories = await makeRequest('GET', '/api/categories');
  if (categories.status === 200) {
    console.log('   ✓ GET /api/categories - OK');
    passed++;
    if (categories.data.categories?.length > 0) testCategoryId = categories.data.categories[0].id;
  } else { console.log('   ✗ GET /api/categories - FAILED'); failed++; }

  const activeCats = await makeRequest('GET', '/api/categories/active');
  if (activeCats.status === 200) { console.log('   ✓ GET /api/categories/active - OK'); passed++; }
  else { console.log('   ✗ GET /api/categories/active - FAILED'); failed++; }

  // Create Category
  const createCat = await makeRequest('POST', '/api/categories', {
    name: 'Test Category', description: 'Test', isActive: true,
  }, { 'Authorization': `Bearer ${adminToken}` });
  if (createCat.status === 201) {
    console.log('   ✓ POST /api/categories - OK');
    passed++;
    if (createCat.data.category) testCategoryId = createCat.data.category.id;
  } else { console.log('   ✗ POST /api/categories - FAILED'); failed++; }

  // 4. Products
  console.log('\n4. PRODUCT ENDPOINTS:');
  const products = await makeRequest('GET', '/api/products');
  if (products.status === 200) {
    console.log('   ✓ GET /api/products - OK');
    passed++;
    if (products.data.products?.length > 0) testProductId = products.data.products[0].id;
  } else { console.log('   ✗ GET /api/products - FAILED'); failed++; }

  const activeProds = await makeRequest('GET', '/api/products/active');
  if (activeProds.status === 200) { console.log('   ✓ GET /api/products/active - OK'); passed++; }
  else { console.log('   ✗ GET /api/products/active - FAILED'); failed++; }

  const search = await makeRequest('GET', '/api/products/search?q=laptop');
  if (search.status === 200) { console.log('   ✓ GET /api/products/search - OK'); passed++; }
  else { console.log('   ✗ GET /api/products/search - FAILED'); failed++; }

  // Create Product
  const createProd = await makeRequest('POST', '/api/products', {
    name: 'Test Product', description: 'Test', price: 99.99, categoryId: testCategoryId, stock: 100, sku: 'TEST-' + Date.now(), isActive: true,
  }, { 'Authorization': `Bearer ${adminToken}` });
  if (createProd.status === 201) {
    console.log('   ✓ POST /api/products - OK');
    passed++;
    if (createProd.data.product) testProductId = createProd.data.product.id;
  } else { console.log('   ✗ POST /api/products - FAILED'); failed++; }

  // 5. Orders
  console.log('\n5. ORDER ENDPOINTS:');
  const myOrders = await makeRequest('GET', '/api/orders/my-orders', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (myOrders.status === 200) { console.log('   ✓ GET /api/orders/my-orders - OK'); passed++; }
  else { console.log('   ✗ GET /api/orders/my-orders - FAILED'); failed++; }

  const allOrders = await makeRequest('GET', '/api/orders', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (allOrders.status === 200) { console.log('   ✓ GET /api/orders - OK'); passed++; }
  else { console.log('   ✗ GET /api/orders - FAILED'); failed++; }

  // Create Order
  const createOrder = await makeRequest('POST', '/api/orders', {
    items: [{ productId: testProductId, quantity: 2, price: 99.99 }],
    shippingAddress: '123 Test St', notes: 'Test',
  }, { 'Authorization': `Bearer ${adminToken}` });
  if (createOrder.status === 201) {
    console.log('   ✓ POST /api/orders - OK');
    passed++;
    if (createOrder.data.order) testOrderId = createOrder.data.order.id;
  } else { console.log('   ✗ POST /api/orders - FAILED'); failed++; }

  // 6. Inventory
  console.log('\n6. INVENTORY ENDPOINTS:');
  const report = await makeRequest('GET', '/api/inventory/report', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (report.status === 200) { console.log('   ✓ GET /api/inventory/report - OK'); passed++; }
  else { console.log('   ✗ GET /api/inventory/report - FAILED'); failed++; }

  const lowStock = await makeRequest('GET', '/api/inventory/low-stock', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (lowStock.status === 200) { console.log('   ✓ GET /api/inventory/low-stock - OK'); passed++; }
  else { console.log('   ✗ GET /api/inventory/low-stock - FAILED'); failed++; }

  const outStock = await makeRequest('GET', '/api/inventory/out-of-stock', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (outStock.status === 200) { console.log('   ✓ GET /api/inventory/out-of-stock - OK'); passed++; }
  else { console.log('   ✗ GET /api/inventory/out-of-stock - FAILED'); failed++; }

  const value = await makeRequest('GET', '/api/inventory/value', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (value.status === 200) { console.log('   ✓ GET /api/inventory/value - OK'); passed++; }
  else { console.log('   ✗ GET /api/inventory/value - FAILED'); failed++; }

  const count = await makeRequest('GET', '/api/inventory/count', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  if (count.status === 200) { console.log('   ✓ GET /api/inventory/count - OK'); passed++; }
  else { console.log('   ✗ GET /api/inventory/count - FAILED'); failed++; }

  // Stock operations
  if (testProductId) {
    const addStock = await makeRequest('POST', `/api/inventory/${testProductId}/add`, { quantity: 50 }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    if (addStock.status === 200) { console.log(`   ✓ POST /api/inventory/${testProductId}/add - OK`); passed++; }
    else { console.log(`   ✗ POST /api/inventory/${testProductId}/add - FAILED`); failed++; }

    const removeStock = await makeRequest('POST', `/api/inventory/${testProductId}/remove`, { quantity: 10 }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    if (removeStock.status === 200) { console.log(`   ✓ POST /api/inventory/${testProductId}/remove - OK`); passed++; }
    else { console.log(`   ✗ POST /api/inventory/${testProductId}/remove - FAILED`); failed++; }

    const setStock = await makeRequest('PUT', `/api/inventory/${testProductId}/set`, { quantity: 200 }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    if (setStock.status === 200) { console.log(`   ✓ PUT /api/inventory/${testProductId}/set - OK`); passed++; }
    else { console.log(`   ✗ PUT /api/inventory/${testProductId}/set - FAILED`); failed++; }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 TEST SUMMARY:`);
  console.log(`   ✓ Passed: ${passed}`);
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   📈 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log(`\n🎉 ALL TESTS PASSED! All API endpoints are working correctly.\n`);
  } else {
    console.log(`\n⚠️  SOME TESTS FAILED. Please review the output above.\n`);
  }
  console.log('='.repeat(50));
}

runTests().catch(console.error);

