import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Client } = pg;

async function runMigrations() {
  if (!config.db.url) {
    logger.error('DATABASE_URL not set. Please set DATABASE_URL in your .env file to run migrations.');
    process.exit(1);
  }

  logger.info('Connecting to Supabase PostgreSQL for migrations...');
  const isRemote = !config.db.url.includes('localhost') && !config.db.url.includes('127.0.0.1');

  const client = new Client({
    connectionString: config.db.url,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    logger.info('Connected to PostgreSQL successfully.');

    const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
    const storagePath = path.resolve(process.cwd(), 'supabase/storage_setup.sql');

    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        logger.info(`Applying migration from ${filePath}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        logger.info(`Migration ${file} applied successfully.`);
      }
    }
    logger.info('All database schema migrations, tables, triggers, and indexes created successfully.');

    if (fs.existsSync(storagePath)) {
      try {
        logger.info(`Applying storage policies from ${storagePath}...`);
        const storageSql = fs.readFileSync(storagePath, 'utf8');
        await client.query(storageSql);
        logger.info('Storage bucket setup and policies applied.');
      } catch (storageErr) {
        logger.warn('Storage SQL note (Supabase storage schema might require dashboard):', storageErr);
      }
    }

    logger.info('Migration complete!');
  } catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
