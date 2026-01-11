const http = require('http');

function request(method, path, data, headers = {}, timeout = 10000) {
  return new Promise((resolve) => {
    const url = new URL(path, 'http://localhost:3000');
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', (e) => resolve({ status: 0, body: '', error: e.message }));
    req.setTimeout(timeout, () => { req.destroy(); resolve({ status: 0, body: '', error: 'timeout' }); });
    
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function debugLogin() {
  console.log('🔍 DEBUG: Testing Login Endpoint\n');
  
  // Test with exact format
  console.log('Test 1: Exact credentials as expected');
  let r = await request('POST', '/api/auth/login', { 
    email: 'admin@openmart.com', 
    password: 'admin123' 
  });
  console.log(`Status: ${r.status}`);
  console.log(`Body: ${r.body}`);
  console.log('');
  
  // Test without normalization
  console.log('Test 2: Different email format');
  r = await request('POST', '/api/auth/login', { 
    email: 'ADMIN@OPENMART.COM', 
    password: 'admin123' 
  });
  console.log(`Status: ${r.status}`);
  console.log(`Body: ${r.body}`);
  console.log('');
  
  // Test validation only
  console.log('Test 3: Invalid email (should fail validation)');
  r = await request('POST', '/api/auth/login', { 
    email: 'invalid-email', 
    password: 'admin123' 
  });
  console.log(`Status: ${r.status}`);
  console.log(`Body: ${r.body}`);
  console.log('');
  
  // Test missing password
  console.log('Test 4: Missing password (should fail validation)');
  r = await request('POST', '/api/auth/login', { 
    email: 'admin@openmart.com'
  });
  console.log(`Status: ${r.status}`);
  console.log(`Body: ${r.body}`);
}

debugLogin().catch(console.error);

