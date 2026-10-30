import { app } from '../app.js';
import { db } from '../db/index.js';
import http from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

let server: http.Server;
let baseUrl: string;
let adminToken: string;
let staffToken: string;

function makeRequest(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options: http.RequestOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode || 500, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Raigon API Reminders & Enhancements Tests...');

  // Start test server on random port
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });

  // Generate tokens
  adminToken = jwt.sign(
    { id: 'admin-uuid', email: 'admin@gmail.com', role: 'admin', name: 'Admin Master' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  staffToken = jwt.sign(
    { id: 'staff-uuid', email: 'staff@gmail.com', role: 'staff', name: 'Staff Member' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('GET', '/health');
    assert(health.status === 200 && health.body.success === true, 'Health endpoint responds 200 OK');

    // 2. Materials endpoint alias
    const materials = await makeRequest('GET', '/api/v1/materials');
    assert(materials.status === 200 && Array.isArray(materials.body.data), 'GET /api/v1/materials returns material master list');

    // 3. Reminders stats
    const statsRes = await makeRequest('GET', '/api/v1/reminders/summary/stats', undefined, staffToken);
    assert(statsRes.status === 200 && typeof statsRes.body.data.all === 'number', 'GET /api/v1/reminders/summary/stats returns stats');

    // 4. Create Reminder
    const newRemPayload = {
      title: 'Customer Pickup Nov 5',
      customerName: 'Ananthu Krishnan',
      customerId: 'RA-1001',
      orderId: 'RA-1001',
      description: 'Call customer regarding completed teak frame pickup.',
      reminderDate: '2026-11-05',
      reminderTime: '14:30',
      priority: 'high',
      assignedStaff: 'Staff Member',
    };

    const createRes = await makeRequest('POST', '/api/v1/reminders', newRemPayload, staffToken);
    assert(createRes.status === 201 && createRes.body.data.title === 'Customer Pickup Nov 5', 'POST /api/v1/reminders creates new reminder');
    const createdId = createRes.body.data?.id;

    // 5. Get Reminder by ID
    const getRes = await makeRequest('GET', `/api/v1/reminders/${createdId}`, undefined, staffToken);
    assert(getRes.status === 200 && getRes.body.data.id === createdId, 'GET /api/v1/reminders/:id returns created reminder');

    // 6. Filter Reminders (Upcoming)
    const upcomingRes = await makeRequest('GET', '/api/v1/reminders?filter=upcoming', undefined, staffToken);
    assert(upcomingRes.status === 200 && Array.isArray(upcomingRes.body.data), 'GET /api/v1/reminders?filter=upcoming filters correctly');

    // 7. Update & Complete Reminder
    const updateRes = await makeRequest(
      'PATCH',
      `/api/v1/reminders/${createdId}`,
      { status: 'completed' },
      adminToken
    );
    assert(
      updateRes.status === 200 &&
        updateRes.body.data.status === 'completed' &&
        Boolean(updateRes.body.data.completedAt),
      'PATCH /api/v1/reminders/:id marks reminder completed with completion metadata'
    );

    // 8. Delete Reminder
    const delRes = await makeRequest('DELETE', `/api/v1/reminders/${createdId}`, undefined, adminToken);
    assert(delRes.status === 200 && delRes.body.success === true, 'DELETE /api/v1/reminders/:id deletes reminder');

    // 9. Customer Listing Sorting - Latest Created First
    const custListRes = await makeRequest('GET', '/api/v1/customers?sortBy=created_at&sortOrder=desc', undefined, staffToken);
    assert(custListRes.status === 200 && Array.isArray(custListRes.body.data), 'GET /api/v1/customers supports sorting by created_at desc');

    // 10. Time filters (Today, This Week, All)
    const todayOrders = await makeRequest('GET', '/api/v1/customers?timeFilter=today', undefined, staffToken);
    assert(todayOrders.status === 200 && todayOrders.body.meta !== undefined, 'GET /api/v1/customers?timeFilter=today works without error');

    const thisWeekOrders = await makeRequest('GET', '/api/v1/customers?timeFilter=thisWeek', undefined, staffToken);
    assert(thisWeekOrders.status === 200 && thisWeekOrders.body.meta !== undefined, 'GET /api/v1/customers?timeFilter=thisWeek works without error');

    console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.`);
  } finally {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
