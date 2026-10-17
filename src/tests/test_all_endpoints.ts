import http from 'http';
import { app } from '../app.js';
import { logger } from '../utils/logger.js';

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  logger.info('🚀 Starting automated test suite for Raigon Art REST API...');
  let testsPassed = 0;
  let testsFailed = 0;

  async function assertReq(name: string, fn: () => Promise<boolean>) {
    try {
      const ok = await fn();
      if (ok) {
        testsPassed++;
        console.log(`  ✅ [PASS] ${name}`);
      } else {
        testsFailed++;
        console.error(`  ❌ [FAIL] ${name}`);
      }
    } catch (err) {
      testsFailed++;
      console.error(`  ❌ [ERROR] ${name}:`, err);
    }
  }

  let authToken = '';
  let refreshToken = '';
  let testCustomerId = 'RA-1002';

  // 1. Health check
  await assertReq('1. GET /health', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const json: any = await res.json();
    return res.status === 200 && json.success === true && json.status === 'ONLINE';
  });

  // 2. Auth: Login
  await assertReq('2. POST /api/v1/auth/login', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin@gmail.com',
        password: 'securePassword123',
      }),
    });
    const json: any = await res.json();
    if (res.status === 200 && json.data?.token) {
      authToken = json.data.token;
      refreshToken = json.data.refreshToken;
      return true;
    }
    return false;
  });

  // 3. Auth: Current Profile
  await assertReq('3. GET /api/v1/auth/me (Protected)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const json: any = await res.json();
    return res.status === 200 && json.data?.email === 'admin@gmail.com';
  });

  // 4. Auth: Refresh Token
  await assertReq('4. POST /api/v1/auth/refresh', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json: any = await res.json();
    return res.status === 200 && !!json.data?.token;
  });

  // 5. Auth: Forgot Password OTP
  await assertReq('5. POST /api/v1/auth/forgot-password', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '8137922114' }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.success === true;
  });

  // 6. Auth: Verify OTP
  let resetToken = '';
  await assertReq('6. POST /api/v1/auth/verify-otp', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '8137922114', otp: '1234' }),
    });
    const json: any = await res.json();
    if (res.status === 200 && json.resetToken) {
      resetToken = json.resetToken;
      return true;
    }
    return false;
  });

  // 7. Auth: Reset Password
  await assertReq('7. POST /api/v1/auth/reset-password', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '8137922114',
        resetToken,
        newPassword: 'securePassword123',
      }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.success === true;
  });

  // 8. Frame Sizes: List
  await assertReq('8. GET /api/v1/frame-sizes', async () => {
    const res = await fetch(`${baseUrl}/api/v1/frame-sizes`);
    const json: any = await res.json();
    return res.status === 200 && Array.isArray(json.data) && json.data.length >= 10;
  });

  // 9. Frame Sizes: Create
  await assertReq('9. POST /api/v1/frame-sizes', async () => {
    const res = await fetch(`${baseUrl}/api/v1/frame-sizes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'FS-TEST',
        name: '30 × 40 inch Extra Large',
        width: 30,
        height: 40,
        unit: 'Inch',
        category: 'Custom',
        active: true,
      }),
    });
    const json: any = await res.json();
    return res.status === 201 && json.data?.code === 'FS-TEST';
  });

  // 10. Frame Sizes: Update
  await assertReq('10. PUT /api/v1/frame-sizes/FS-TEST', async () => {
    const res = await fetch(`${baseUrl}/api/v1/frame-sizes/FS-TEST`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '30 × 40 inch Gallery Grade' }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.data?.name === '30 × 40 inch Gallery Grade';
  });

  // 11. Frame Sizes: Delete
  await assertReq('11. DELETE /api/v1/frame-sizes/FS-TEST', async () => {
    const res = await fetch(`${baseUrl}/api/v1/frame-sizes/FS-TEST`, {
      method: 'DELETE',
    });
    const json: any = await res.json();
    return res.status === 200 && json.success === true;
  });

  // 12. Customers: Next ID
  await assertReq('12. GET /api/v1/customers/next-id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/next-id`);
    const json: any = await res.json();
    return res.status === 200 && json.nextId.startsWith('RA-');
  });

  // 13. Customers: List & Pagination
  await assertReq('13. GET /api/v1/customers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers?page=1&limit=5`);
    const json: any = await res.json();
    return res.status === 200 && json.meta?.total >= 2 && Array.isArray(json.data);
  });

  // 14. Customers: Create
  await assertReq('14. POST /api/v1/customers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'RA-9999',
        name: 'Automated Test Customer',
        phone: '9895000000',
        city: 'Kollam',
        address: 'Beach Road, Kollam',
        pincode: '691001',
        total: 5000,
        advance: 2500,
        status: 'pending',
        frames: [
          {
            size: '12 × 18 inch',
            frameType: 'Teak Wood Moulding',
            qty: 1,
            notes: 'Test framing order',
          },
        ],
      }),
    });
    const json: any = await res.json();
    if (res.status === 201 && json.data?.id === 'RA-9999') {
      testCustomerId = json.data.id;
      return true;
    }
    return false;
  });

  // 15. Customers: Get Single
  await assertReq('15. GET /api/v1/customers/:id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}`);
    const json: any = await res.json();
    return res.status === 200 && json.data?.id === testCustomerId;
  });

  // 16. Customers: Quick Status Change
  await assertReq('16. PATCH /api/v1/customers/:id/status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.status === 'completed';
  });

  // 17. Customers: Quick Payment Update
  await assertReq('17. PATCH /api/v1/customers/:id/payment', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ advance: 5000, paymentStatus: 'Paid' }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.advance === 5000 && json.balance === 0;
  });

  // 18. Customers: Export CSV
  await assertReq('18. GET /api/v1/customers/export/csv', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/export/csv`);
    const text = await res.text();
    return res.status === 200 && text.includes('Order ID') && text.includes('Customer Name');
  });

  // 19. Customers: Invoice PDF
  await assertReq('19. GET /api/v1/customers/:id/invoice', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/invoice`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type');
    return res.status === 200 && (contentType?.includes('application/pdf') ?? false) && buffer.byteLength > 1000;
  });

  // 20. Customers: Photos ZIP Download
  await assertReq('20. GET /api/v1/customers/:id/photos/download-zip', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/photos/download-zip`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type');
    return res.status === 200 && (contentType?.includes('application/zip') ?? false) && buffer.byteLength > 0;
  });

  // 21. Dashboard Stats
  await assertReq('21. GET /api/v1/dashboard/stats', async () => {
    const res = await fetch(`${baseUrl}/api/v1/dashboard/stats`);
    const json: any = await res.json();
    return res.status === 200 && typeof json.data?.totalRevenue === 'number';
  });

  // 22. Reports Summary
  await assertReq('22. GET /api/v1/reports/summary', async () => {
    const res = await fetch(`${baseUrl}/api/v1/reports/summary?period=month1`);
    const json: any = await res.json();
    return res.status === 200 && typeof json.data?.grossSales === 'number';
  });

  // 23. WhatsApp: Order Confirmation
  await assertReq('23. POST /api/v1/whatsapp/send-order-confirmation', async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/send-order-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: testCustomerId }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.status === 'sent';
  });

  // 24. WhatsApp: Status Update
  await assertReq('24. POST /api/v1/whatsapp/send-status-update', async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/send-status-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: testCustomerId,
        status: 'completed',
        customNote: 'Your frames are ready!',
      }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.status === 'sent';
  });

  // 24b. WhatsApp: Get Status
  await assertReq('24b. GET /api/v1/whatsapp/status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/whatsapp/status`);
    const json: any = await res.json();
    return res.status === 200 && json.success === true && typeof json.data?.configured === 'boolean';
  });

  // 25. Workshop Settings: Get Profile
  await assertReq('25. GET /api/v1/settings/profile', async () => {
    const res = await fetch(`${baseUrl}/api/v1/settings/profile`);
    const json: any = await res.json();
    return res.status === 200 && json.data?.businessName === 'Raigon Arts';
  });

  // 26. Workshop Settings: Update Profile
  await assertReq('26. PUT /api/v1/settings/profile', async () => {
    const res = await fetch(`${baseUrl}/api/v1/settings/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagline: 'Premium Custom Framing & Fine Art Prints' }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.data?.tagline === 'Premium Custom Framing & Fine Art Prints';
  });

  // 27. Customers: Delete
  await assertReq('27. DELETE /api/v1/customers/:id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}`, {
      method: 'DELETE',
    });
    const json: any = await res.json();
    return res.status === 200 && json.success === true;
  });

  // 28. Data Retention: Get Global Policy
  await assertReq('28. GET /api/v1/settings/retention', async () => {
    const res = await fetch(`${baseUrl}/api/v1/settings/retention`);
    const json: any = await res.json();
    return res.status === 200 && json.data?.retentionDays === 45 && json.data?.autoCleanupEnabled === true;
  });

  // 29. Data Retention: Update Global Policy (e.g. change to 60 days globally)
  await assertReq('29. PUT /api/v1/settings/retention', async () => {
    const res = await fetch(`${baseUrl}/api/v1/settings/retention`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: 45, enabled: true, target: 'all' }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.data?.retentionDays === 45;
  });

  // 30. Data Retention: Trigger Manual Cleanup
  await assertReq('30. POST /api/v1/settings/cleanup/trigger', async () => {
    const res = await fetch(`${baseUrl}/api/v1/settings/cleanup/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: 45 }),
    });
    const json: any = await res.json();
    return res.status === 200 && json.data?.success === true;
  });

  server.close();

  console.log('\n=======================================================');
  console.log(`  TEST RESULTS: ${testsPassed} PASSED | ${testsFailed} FAILED`);
  console.log('=======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution failure:', err);
  process.exit(1);
});
