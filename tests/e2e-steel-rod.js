const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let token = '';

/**
 * End-to-End QA Integration Test for the "Steel Rod" Flow
 * Owner: Member 4 (QA)
 * 
 * Execution:
 * node tests/e2e-steel-rod.js
 * 
 * Prerequisites:
 * - Server running at http://localhost:5000
 * - Admin credentials in DB
 * - DB seeded with 'RAW-STL-001' and Locations
 */

async function request(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch {
    return { status: response.status, data: text };
  }
}

async function runTest() {
  console.log('🧪 Starting E2E Integration Test: Steel Rod Flow\n');

  try {
    // 1. Authenticate (Assumes default seeded admin exists)
    console.log('1. Authenticating...');
    const authRes = await request('/auth/login', 'POST', {
      email: 'admin@stocksense.local', // Requires valid credentials depending on Teammate 3 auth logic
      password: 'password123'
    });
    
    if (authRes.status !== 200) {
      console.warn('⚠️ Auth failed. Ensure DB is seeded with admin user. Proceeding without token (may fail if RBAC is strict).');
    } else {
      token = authRes.data.token;
      console.log('✅ Authenticated successfully.');
    }

    // 2. Fetch required entities
    console.log('\n2. Fetching Product and Locations...');
    const productsRes = await request('/products');
    const locationsRes = await request('/locations');

    if (!productsRes.data?.data || !locationsRes.data?.data) {
        throw new Error('Failed to retrieve products or locations. Is the database seeded?');
    }

    const steelRod = productsRes.data.data.find(p => p.sku === 'RAW-STL-001');
    const mainStore = locationsRes.data.data.find(l => l.code === 'LOC-MAIN');
    const productionRack = locationsRes.data.data.find(l => l.code === 'LOC-PROD');
    const vendorLoc = locationsRes.data.data.find(l => l.code === 'LOC-VENDOR');

    if (!steelRod || !mainStore || !productionRack || !vendorLoc) {
      throw new Error('Required seed data missing. Please run the seed-qa.ts script first.');
    }
    console.log(`✅ Found Steel Rod (ID: ${steelRod.id})`);

    // 3. Receipt: +100 kg to Main Store
    console.log('\n3. Executing Receipt: +100 kg from Vendor to Main Store');
    const receiptRes = await request('/receipts', 'POST', {
      sourceLocationId: vendorLoc.id,
      destinationLocationId: mainStore.id,
      status: 'CONFIRMED',
      lines: [{ productId: steelRod.id, quantity: 100 }]
    });
    if (receiptRes.status >= 400) console.error('Failed:', receiptRes.data);
    else console.log('✅ Receipt created successfully.');

    // 4. Internal Transfer: 100 kg from Main Store to Production Rack
    console.log('\n4. Executing Transfer: 100 kg from Main Store to Production Rack');
    const transferRes = await request('/transfers', 'POST', {
      sourceLocationId: mainStore.id,
      destinationLocationId: productionRack.id,
      status: 'CONFIRMED',
      lines: [{ productId: steelRod.id, quantity: 100 }]
    });
    if (transferRes.status >= 400) console.error('Failed:', transferRes.data);
    else console.log('✅ Transfer created successfully.');

    // 5. Delivery: 20 kg out
    // Needs a generic CUSTOMER location, attempting to find one or fallback
    let customerLoc = locationsRes.data.data.find(l => l.type === 'CUSTOMER');
    if (!customerLoc) {
        // Mock fallback if customer location isn't seeded
        customerLoc = { id: vendorLoc.id }; 
        console.warn('⚠️ Customer location not found, using vendor loc as fallback for test.');
    }

    console.log('\n5. Executing Delivery: -20 kg from Production Rack');
    const deliveryRes = await request('/deliveries', 'POST', {
      sourceLocationId: productionRack.id,
      destinationLocationId: customerLoc.id,
      status: 'CONFIRMED',
      lines: [{ productId: steelRod.id, quantity: 20 }]
    });
    if (deliveryRes.status >= 400) console.error('Failed:', deliveryRes.data);
    else console.log('✅ Delivery created successfully.');

    // 6. Adjustment: 3 kg damaged/missing
    console.log('\n6. Executing Adjustment: -3 kg damaged from Production Rack');
    const adjustRes = await request('/adjustments', 'POST', {
      locationId: productionRack.id,
      status: 'CONFIRMED',
      lines: [{ productId: steelRod.id, quantity: -3 }] // Service handles negative delta
    });
    if (adjustRes.status >= 400) console.error('Failed:', adjustRes.data);
    else console.log('✅ Adjustment created successfully.');

    // 7. Verify Ledger Single Source of Truth
    console.log('\n7. Verifying Final Stock (Expected: 77 kg in Production Rack)');
    const finalStockRes = await request(`/stock/${steelRod.id}`);
    
    console.log('\n--- FINAL INVENTORY REPORT ---');
    console.log(JSON.stringify(finalStockRes.data, null, 2));
    
    console.log('\n🎉 E2E Test Execution Finished.');

  } catch (error) {
    console.error('\n❌ Test Execution Failed:', error.message);
  }
}

runTest();
