import pg from 'pg';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnected = false;

export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  if (!config.db.url || config.db.url.includes('postgres:postgres@localhost')) {
    logger.info('No remote DATABASE_URL configured. Database fallback mode ready.');
    return null;
  }

  try {
    const isRemote = !config.db.url.includes('localhost') && !config.db.url.includes('127.0.0.1');

    pool = new Pool({
      connectionString: config.db.url,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', err);
    });

    return pool;
  } catch (err) {
    logger.error('Failed to create database pool:', err);
    return null;
  }
}

export async function testDbConnection(): Promise<boolean> {
  const p = getDbPool();
  if (!p) return false;

  try {
    const client = await p.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    isConnected = true;
    logger.info('Connected to PostgreSQL (Supabase) successfully. DB Time:', res.rows[0].now);
    return true;
  } catch (error) {
    logger.warn('Could not connect to PostgreSQL via connection string. Operating with data manager adapter.', error);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
