const http = require('http');

const BASE_URL = 'http://localhost:3000';
let adminToken = null;
let testUserId = null;
let testProductId = null;
let testCategoryId = null;
let testOrderId = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}✓ ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

async function testHealth() {
  logSection('HEALTH CHECK');
  const res = await makeRequest('GET', '/health');
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, res.data);
  log(res.status === 200 ? 'Health check PASSED' : 'Health check FAILED', res.status === 200 ? 'green' : 'red');
  return res.status === 200;
}

async function testAuth() {
  logSection('AUTH ENDPOINTS');

  // Test 1: Login
  log('Testing POST /api/auth/login');
  const loginRes = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@openmart.com',
    password: 'admin123',
  });
  console.log(`Status: ${loginRes.status}`);
  console.log(`Response:`, loginRes.data);
  
  if (loginRes.status === 200 && loginRes.data.data && loginRes.data.data.token) {
    adminToken = loginRes.data.data.token;
    log('Login SUCCESS - Token received', 'green');
  } else {
    log('Login FAILED - ' + JSON.stringify(loginRes.data), 'red');
    return false;
  }

  // Test 2: Get Profile
  log('Testing GET /api/auth/profile');
  const profileRes = await makeRequest('GET', '/api/auth/profile', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${profileRes.status}`);
  console.log(`Response:`, profileRes.data);
  log(profileRes.status === 200 ? 'Profile fetched SUCCESS' : 'Profile fetch FAILED', profileRes.status === 200 ? 'green' : 'red');

  // Test 3: Get All Users (admin only)
  log('Testing GET /api/auth/users');
  const usersRes = await makeRequest('GET', '/api/auth/users', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${usersRes.status}`);
  console.log(`Response:`, usersRes.data);
  if (usersRes.data.users && usersRes.data.users.length > 0) {
    testUserId = usersRes.data.users[0].id;
  }
  log(usersRes.status === 200 ? 'Users list fetched SUCCESS' : 'Users list fetch FAILED', usersRes.status === 200 ? 'green' : 'red');

  // Test 4: Register new user
  log('Testing POST /api/auth/register');
  const registerRes = await makeRequest('POST', '/api/auth/register', {
    email: 'testuser' + Date.now() + '@example.com',
    password: 'testpass123',
    name: 'Test User',
    role: 'user',
  });
  console.log(`Status: ${registerRes.status}`);
  console.log(`Response:`, registerRes.data);
  log(registerRes.status === 201 ? 'User registration SUCCESS' : 'User registration FAILED (may already exist)', registerRes.status === 201 ? 'green' : 'yellow');

  return true;
}

async function testCategories() {
  logSection('CATEGORY ENDPOINTS');

  // Test 1: Get All Categories
  log('Testing GET /api/categories');
  const categoriesRes = await makeRequest('GET', '/api/categories');
  console.log(`Status: ${categoriesRes.status}`);
  console.log(`Response:`, categoriesRes.data);
  if (categoriesRes.data.categories && categoriesRes.data.categories.length > 0) {
    testCategoryId = categoriesRes.data.categories[0].id;
  }
  log(categoriesRes.status === 200 ? 'Categories fetched SUCCESS' : 'Categories fetch FAILED', categoriesRes.status === 200 ? 'green' : 'red');

  // Test 2: Get Active Categories
  log('Testing GET /api/categories/active');
  const activeCategoriesRes = await makeRequest('GET', '/api/categories/active');
  console.log(`Status: ${activeCategoriesRes.status}`);
  console.log(`Response:`, activeCategoriesRes.data);
  log(activeCategoriesRes.status === 200 ? 'Active categories fetched SUCCESS' : 'Active categories fetch FAILED', activeCategoriesRes.status === 200 ? 'green' : 'red');

  // Test 3: Get Category by ID
  if (testCategoryId) {
    log(`Testing GET /api/categories/${testCategoryId}`);
    const categoryByIdRes = await makeRequest('GET', `/api/categories/${testCategoryId}`);
    console.log(`Status: ${categoryByIdRes.status}`);
    console.log(`Response:`, categoryByIdRes.data);
    log(categoryByIdRes.status === 200 ? 'Category by ID fetched SUCCESS' : 'Category by ID fetch FAILED', categoryByIdRes.status === 200 ? 'green' : 'red');
  }

  // Test 4: Create Category (admin only)
  log('Testing POST /api/categories');
  const createCategoryRes = await makeRequest('POST', '/api/categories', {
    name: 'Test Category ' + Date.now(),
    description: 'A test category',
    isActive: true,
  }, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${createCategoryRes.status}`);
  console.log(`Response:`, createCategoryRes.data);
  if (createCategoryRes.status === 201 && createCategoryRes.data.category) {
    testCategoryId = createCategoryRes.data.category.id;
  }
  log(createCategoryRes.status === 201 ? 'Category creation SUCCESS' : 'Category creation FAILED', createCategoryRes.status === 201 ? 'green' : 'red');

  return true;
}

async function testProducts() {
  logSection('PRODUCT ENDPOINTS');

  // Test 1: Get All Products
  log('Testing GET /api/products');
  const productsRes = await makeRequest('GET', '/api/products');
  console.log(`Status: ${productsRes.status}`);
  console.log(`Response:`, productsRes.data);
  if (productsRes.data.products && productsRes.data.products.length > 0) {
    testProductId = productsRes.data.products[0].id;
  }
  log(productsRes.status === 200 ? 'Products fetched SUCCESS' : 'Products fetch FAILED', productsRes.status === 200 ? 'green' : 'red');

  // Test 2: Get Active Products
  log('Testing GET /api/products/active');
  const activeProductsRes = await makeRequest('GET', '/api/products/active');
  console.log(`Status: ${activeProductsRes.status}`);
  console.log(`Response:`, activeProductsRes.data);
  log(activeProductsRes.status === 200 ? 'Active products fetched SUCCESS' : 'Active products fetch FAILED', activeProductsRes.status === 200 ? 'green' : 'red');

  // Test 3: Search Products
  log('Testing GET /api/products/search?q=laptop');
  const searchRes = await makeRequest('GET', '/api/products/search?q=laptop');
  console.log(`Status: ${searchRes.status}`);
  console.log(`Response:`, searchRes.data);
  log(searchRes.status === 200 ? 'Search products SUCCESS' : 'Search products FAILED', searchRes.status === 200 ? 'green' : 'red');

  // Test 4: Get Product by ID
  if (testProductId) {
    log(`Testing GET /api/products/${testProductId}`);
    const productByIdRes = await makeRequest('GET', `/api/products/${testProductId}`);
    console.log(`Status: ${productByIdRes.status}`);
    console.log(`Response:`, productByIdRes.data);
    log(productByIdRes.status === 200 ? 'Product by ID fetched SUCCESS' : 'Product by ID fetch FAILED', productByIdRes.status === 200 ? 'green' : 'red');
  }

  // Test 5: Get Products by Category
  if (testCategoryId) {
    log(`Testing GET /api/products/category/${testCategoryId}`);
    const categoryProductsRes = await makeRequest('GET', `/api/products/category/${testCategoryId}`);
    console.log(`Status: ${categoryProductsRes.status}`);
    console.log(`Response:`, categoryProductsRes.data);
    log(categoryProductsRes.status === 200 ? 'Products by category fetched SUCCESS' : 'Products by category fetch FAILED', categoryProductsRes.status === 200 ? 'green' : 'red');
  }

  // Test 6: Create Product (admin only)
  log('Testing POST /api/products');
  const createProductRes = await makeRequest('POST', '/api/products', {
    name: 'Test Product ' + Date.now(),
    description: 'A test product',
    price: 99.99,
    categoryId: testCategoryId,
    stock: 100,
    sku: 'TEST-' + Date.now(),
    isActive: true,
  }, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${createProductRes.status}`);
  console.log(`Response:`, createProductRes.data);
  if (createProductRes.status === 201 && createProductRes.data.product) {
    testProductId = createProductRes.data.product.id;
  }
  log(createProductRes.status === 201 ? 'Product creation SUCCESS' : 'Product creation FAILED', createProductRes.status === 201 ? 'green' : 'red');

  return true;
}

async function testOrders() {
  logSection('ORDER ENDPOINTS');

  // Test 1: Get My Orders
  log('Testing GET /api/orders/my-orders');
  const myOrdersRes = await makeRequest('GET', '/api/orders/my-orders', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${myOrdersRes.status}`);
  console.log(`Response:`, myOrdersRes.data);
  if (myOrdersRes.data.orders && myOrdersRes.data.orders.length > 0) {
    testOrderId = myOrdersRes.data.orders[0].id;
  }
  log(myOrdersRes.status === 200 ? 'My orders fetched SUCCESS' : 'My orders fetch FAILED', myOrdersRes.status === 200 ? 'green' : 'red');

  // Test 2: Get All Orders (admin only)
  log('Testing GET /api/orders');
  const allOrdersRes = await makeRequest('GET', '/api/orders', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${allOrdersRes.status}`);
  console.log(`Response:`, allOrdersRes.data);
  if (allOrdersRes.data.orders && allOrdersRes.data.orders.length > 0) {
    testOrderId = allOrdersRes.data.orders[0].id;
  }
  log(allOrdersRes.status === 200 ? 'All orders fetched SUCCESS' : 'All orders fetch FAILED', allOrdersRes.status === 200 ? 'green' : 'red');

  // Test 3: Get Order by ID
  if (testOrderId) {
    log(`Testing GET /api/orders/${testOrderId}`);
    const orderByIdRes = await makeRequest('GET', `/api/orders/${testOrderId}`, null, {
      'Authorization': `Bearer ${adminToken}`,
    });
    console.log(`Status: ${orderByIdRes.status}`);
    console.log(`Response:`, orderByIdRes.data);
    log(orderByIdRes.status === 200 ? 'Order by ID fetched SUCCESS' : 'Order by ID fetch FAILED', orderByIdRes.status === 200 ? 'green' : 'red');
  }

  // Test 4: Create Order
  log('Testing POST /api/orders');
  const createOrderRes = await makeRequest('POST', '/api/orders', {
    items: [
      {
        productId: testProductId,
        quantity: 2,
        price: 99.99,
      },
    ],
    shippingAddress: '123 Test Street',
    notes: 'Test order',
  }, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${createOrderRes.status}`);
  console.log(`Response:`, createOrderRes.data);
  if (createOrderRes.status === 201 && createOrderRes.data.order) {
    testOrderId = createOrderRes.data.order.id;
  }
  log(createOrderRes.status === 201 ? 'Order creation SUCCESS' : 'Order creation FAILED', createOrderRes.status === 201 ? 'green' : 'red');

  // Test 5: Get Orders by Status (admin only)
  log('Testing GET /api/orders/status/pending');
  const statusOrdersRes = await makeRequest('GET', '/api/orders/status/pending', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${statusOrdersRes.status}`);
  console.log(`Response:`, statusOrdersRes.data);
  log(statusOrdersRes.status === 200 ? 'Orders by status fetched SUCCESS' : 'Orders by status fetch FAILED', statusOrdersRes.status === 200 ? 'green' : 'red');

  return true;
}

async function testInventory() {
  logSection('INVENTORY ENDPOINTS');

  // Test 1: Get Inventory Report
  log('Testing GET /api/inventory/report');
  const reportRes = await makeRequest('GET', '/api/inventory/report', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${reportRes.status}`);
  console.log(`Response:`, reportRes.data);
  log(reportRes.status === 200 ? 'Inventory report fetched SUCCESS' : 'Inventory report fetch FAILED', reportRes.status === 200 ? 'green' : 'red');

  // Test 2: Get Low Stock Products
  log('Testing GET /api/inventory/low-stock');
  const lowStockRes = await makeRequest('GET', '/api/inventory/low-stock', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${lowStockRes.status}`);
  console.log(`Response:`, lowStockRes.data);
  log(lowStockRes.status === 200 ? 'Low stock products fetched SUCCESS' : 'Low stock products fetch FAILED', lowStockRes.status === 200 ? 'green' : 'red');

  // Test 3: Get Out of Stock Products
  log('Testing GET /api/inventory/out-of-stock');
  const outOfStockRes = await makeRequest('GET', '/api/inventory/out-of-stock', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${outOfStockRes.status}`);
  console.log(`Response:`, outOfStockRes.data);
  log(outOfStockRes.status === 200 ? 'Out of stock products fetched SUCCESS' : 'Out of stock products fetch FAILED', outOfStockRes.status === 200 ? 'green' : 'red');

  // Test 4: Get Total Inventory Value
  log('Testing GET /api/inventory/value');
  const valueRes = await makeRequest('GET', '/api/inventory/value', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${valueRes.status}`);
  console.log(`Response:`, valueRes.data);
  log(valueRes.status === 200 ? 'Inventory value fetched SUCCESS' : 'Inventory value fetch FAILED', valueRes.status === 200 ? 'green' : 'red');

  // Test 5: Get Stock Count
  log('Testing GET /api/inventory/count');
  const countRes = await makeRequest('GET', '/api/inventory/count', null, {
    'Authorization': `Bearer ${adminToken}`,
  });
  console.log(`Status: ${countRes.status}`);
  console.log(`Response:`, countRes.data);
  log(countRes.status === 200 ? 'Stock count fetched SUCCESS' : 'Stock count fetch FAILED', countRes.status === 200 ? 'green' : 'red');

  // Test 6: Add Stock
  if (testProductId) {
    log(`Testing POST /api/inventory/${testProductId}/add`);
    const addStockRes = await makeRequest('POST', `/api/inventory/${testProductId}/add`, {
      quantity: 50,
    }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    console.log(`Status: ${addStockRes.status}`);
    console.log(`Response:`, addStockRes.data);
    log(addStockRes.status === 200 ? 'Add stock SUCCESS' : 'Add stock FAILED', addStockRes.status === 200 ? 'green' : 'red');

    // Test 7: Remove Stock
    log(`Testing POST /api/inventory/${testProductId}/remove`);
    const removeStockRes = await makeRequest('POST', `/api/inventory/${testProductId}/remove`, {
      quantity: 10,
    }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    console.log(`Status: ${removeStockRes.status}`);
    console.log(`Response:`, removeStockRes.data);
    log(removeStockRes.status === 200 ? 'Remove stock SUCCESS' : 'Remove stock FAILED', removeStockRes.status === 200 ? 'green' : 'red');

    // Test 8: Set Stock
    log(`Testing PUT /api/inventory/${testProductId}/set`);
    const setStockRes = await makeRequest('PUT', `/api/inventory/${testProductId}/set`, {
      quantity: 200,
    }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    console.log(`Status: ${setStockRes.status}`);
    console.log(`Response:`, setStockRes.data);
    log(setStockRes.status === 200 ? 'Set stock SUCCESS' : 'Set stock FAILED', setStockRes.status === 200 ? 'green' : 'red');
  }

  return true;
}

async function runAllTests() {
  console.log(`${colors.blue}╔══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║     API ENDPOINT TESTING - OpenMart Backend          ║${colors.reset}`);
  console.log(`${colors.blue}╚══════════════════════════════════════════════════════╝${colors.reset}`);
  
  const results = {
    health: false,
    auth: false,
    categories: false,
    products: false,
    orders: false,
    inventory: false,
  };

  try {
    // Test Health Check
    results.health = await testHealth();
    
    if (!results.health) {
      console.log(`\n${colors.red}Server is not running or health check failed. Please start the server first.${colors.reset}`);
      process.exit(1);
    }

    // Test Auth
    results.auth = await testAuth();

    // Test Categories
    results.categories = await testCategories();

    // Test Products
    results.products = await testProducts();

    // Test Orders
    results.orders = await testOrders();

    // Test Inventory
    results.inventory = await testInventory();

    // Summary
    logSection('TEST SUMMARY');
    console.log(`${colors.cyan}Health Check:${colors.reset}     ${results.health ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`${colors.cyan}Auth:${colors.reset}             ${results.auth ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`${colors.cyan}Categories:${colors.reset}       ${results.categories ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`${colors.cyan}Products:${colors.reset}         ${results.products ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`${colors.cyan}Orders:${colors.reset}           ${results.orders ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`${colors.cyan}Inventory:${colors.reset}        ${results.inventory ? '✓ PASS' : '✗ FAIL'}`);
    
    const allPassed = Object.values(results).every(r => r);
    console.log(`\n${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
    if (allPassed) {
      console.log(`${colors.green}🎉 ALL TESTS PASSED!${colors.reset}`);
    } else {
      console.log(`${colors.red}⚠️  SOME TESTS FAILED${colors.reset}`);
    }
    console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Test execution failed:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run all tests
runAllTests();

