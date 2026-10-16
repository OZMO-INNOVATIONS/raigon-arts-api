import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Client } = pg;

async function runSeed() {
  if (!config.db.url) {
    logger.error('DATABASE_URL not set in .env.');
    process.exit(1);
  }

  logger.info('Connecting to Supabase PostgreSQL to seed initial data...');
  const isRemote = !config.db.url.includes('localhost') && !config.db.url.includes('127.0.0.1');

  const client = new Client({
    connectionString: config.db.url,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    const seedPath = path.resolve(process.cwd(), 'supabase/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    logger.info(`Executing seed script from ${seedPath}...`);
    await client.query(seedSql);
    logger.info('Database seeded successfully with admin user, workshop settings, frame sizes, and sample orders!');
  } catch (err) {
    logger.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();
