import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { config } from '../config/env.js';
import { db } from '../db/index.js';

async function verifySupabase() {
  console.log('\n============================================================');
  console.log('   RAIGON ART - SUPABASE CUSTOMER DATA STORAGE VERIFICATION');
  console.log('============================================================\n');

  console.log(`1. Supabase Configuration Check:`);
  console.log(`   - Project URL: ${config.supabase.url}`);
  console.log(`   - Storage Bucket: ${config.supabase.storageBucket}`);
  console.log(`   - Configured: ${isSupabaseConfigured() ? '✅ YES' : '❌ NO'}\n`);

  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not properly configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const sb = getSupabase();

  // 2. Storage Bucket Check
  console.log('2. Supabase Storage Check:');
  const { data: buckets, error: bucketErr } = await sb.storage.listBuckets();
  if (bucketErr) {
    console.log(`   ❌ Error querying buckets: ${bucketErr.message}`);
  } else {
    const targetBucket = buckets?.find((b) => b.id === config.supabase.storageBucket);
    if (targetBucket) {
      console.log(`   ✅ Bucket "${config.supabase.storageBucket}" exists and is ${targetBucket.public ? 'PUBLIC' : 'PRIVATE'}.`);
    } else {
      console.log(`   ⚠️ Bucket "${config.supabase.storageBucket}" not found in list. Available: ${buckets?.map((b) => b.id).join(', ') || 'None'}`);
    }
  }

  // 3. Database Tables Check
  console.log('\n3. Supabase Database Tables Check:');
  const requiredTables = [
    'users',
    'workshop_settings',
    'frame_sizes_master',
    'customers',
    'customer_photos',
    'customer_frames',
    'activity_logs',
    'otp_tokens',
  ];

  let missingTables = 0;
  for (const table of requiredTables) {
    const { data, error } = await sb.from(table).select('*').limit(1);
    if (error) {
      console.log(`   ❌ Table "public.${table}": MISSING (${error.message})`);
      missingTables++;
    } else {
      console.log(`   ✅ Table "public.${table}": OK (Accessible)`);
    }
  }

  if (missingTables > 0) {
    console.log('\n------------------------------------------------------------');
    console.log('⚠️  ACTION REQUIRED:');
    console.log('   The Supabase PostgreSQL database tables are not yet created in your Supabase project.');
    console.log(`   Project URL: ${config.supabase.url}`);
    console.log('   To apply the schema:');
    console.log('   1. Open Supabase Dashboard:');
    console.log(`      https://supabase.com/dashboard/project/${config.supabase.url.replace('https://', '').replace('.supabase.co', '')}/sql/new`);
    console.log('   2. Copy the contents of: supabase/migrations/20261016_init_schema.sql');
    console.log('   3. Paste and click "Run"');
    console.log('   4. (Optional) Run supabase/seed.sql to insert sample customers and frame sizes.');
    console.log('------------------------------------------------------------\n');
    return;
  }

  // 4. Test Customer End-to-End Persistence
  console.log('\n4. Testing Live Customer Data Storage in Supabase:');
  const testId = `RA-TEST-${Date.now().toString().slice(-4)}`;

  try {
    console.log(`   - Creating test customer ${testId} with frame and photo metadata...`);
    const created = await db.customers.createCustomer(
      {
        id: testId,
        name: 'Supabase Verification Test',
        phone: '9876500000',
        city: 'Trivandrum',
        address: 'MG Road, Trivandrum',
        pincode: '695001',
        total: 4500,
        advance: 2000,
        status: 'pending',
      },
      [
        {
          name: 'verification_photo.jpg',
          url: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/verification_photo.jpg',
          sizeBytes: 1048576,
          mimeType: 'image/jpeg',
        },
      ],
      [
        {
          size: '12 × 18 inch',
          frameType: 'Teak Wood Moulding',
          qty: 1,
          notes: 'Supabase direct test frame',
        },
      ]
    );

    // Verify row directly in Supabase
    const { data: dbCust, error: fetchErr } = await sb
      .from('customers')
      .select('*, customer_photos(*), customer_frames(*)')
      .eq('id', testId)
      .single();

    if (fetchErr || !dbCust) {
      console.log(`   ❌ Customer ${testId} was not found in Supabase table:`, fetchErr?.message);
    } else {
      console.log(`   ✅ Customer successfully stored in Supabase table 'customers'!`);
      console.log(`      ID: ${dbCust.id} | Name: ${dbCust.name} | Total: ₹${dbCust.total} | Advance: ₹${dbCust.advance} | Balance: ₹${dbCust.balance}`);
      console.log(`      Photos in customer_photos: ${dbCust.customer_photos?.length || 0}`);
      console.log(`      Frames in customer_frames: ${dbCust.customer_frames?.length || 0}`);
    }

    // Clean up test customer
    console.log(`   - Cleaning up test record ${testId}...`);
    await db.customers.deleteCustomer(testId);
    console.log(`   ✅ Test record cleaned up.`);
  } catch (err: any) {
    console.error(`   ❌ Error during customer storage test:`, err?.message || err);
  }

  console.log('\n============================================================');
  console.log('   VERIFICATION COMPLETE');
  console.log('============================================================\n');
}

verifySupabase().catch(console.error);
