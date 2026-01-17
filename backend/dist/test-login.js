// File: src/test-login.ts
async function testLogin() {
    console.log("⏳ Sedang mencoba Login ke Server...");
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@openmart.com',
                password: 'admin123',
            }),
        });
        const data = await response.json();
        console.log("---------------------------------------------------");
        console.log(`STATUS: ${response.status} ${response.statusText}`);
        console.log("RESPONSE SERVER:");
        console.dir(data, { depth: null });
        console.log("---------------------------------------------------");
    }
    catch (error) {
        console.error("❌ Gagal connect ke server. Pastikan server nyala!", error);
    }
}
testLogin();
//# sourceMappingURL=test-login.js.map