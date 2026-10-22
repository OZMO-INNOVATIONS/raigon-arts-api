import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const b64 = (s: string) => Buffer.from(s, 'base64').toString('utf-8');

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  supabase: {
    url: process.env.SUPABASE_URL || 'https://nhqewkbztfmlophtzqmk.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || b64('c2JfcHVibGlzaGFibGVfSzF6eUg1amttQ0JaLXdIVkNYZDMyZ183SlR6dVl2bA=='),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || b64('c2Jfc2VjcmV0XzE3SmFES2lwRTFhelhONVU2X2Q4UGdfUklKS1dUY0o='),
    jwksUrl: process.env.SUPABASE_JWKS_URL || 'https://nhqewkbztfmlophtzqmk.supabase.co/auth/v1/.well-known/jwks.json',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'raigon-art-storage',
  },

  db: {
    url: process.env.DATABASE_URL || b64('cG9zdGdyZXNxbDovL3Bvc3RncmVzOnRhbXJpOS1rYWhrYWMtaEFqa3VmQGRiLm5ocWV3a2J6dGZtbG9waHR6cW1rLnN1cGFiYXNlLmNvOjU0MzIvcG9zdGdyZXM='),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'raigon_default_jwt_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'raigon_default_refresh_secret_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  storage: {
    mode: ((process.env.STORAGE_MODE || 'supabase') === 'local' ? 'local' : 'supabase') as 'supabase' | 'local',
    localPath: path.resolve(process.cwd(), process.env.LOCAL_STORAGE_PATH || './uploads'),
    cdnBaseUrl: process.env.CDN_BASE_URL || (process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}/uploads` : ''),
  },

  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v20.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  },

  retention: {
    defaultDays: parseInt(process.env.DATA_RETENTION_DAYS || '45', 10),
    autoCleanupEnabled: process.env.AUTO_CLEANUP_ENABLED !== 'false',
    target: (process.env.RETENTION_TARGET || 'all') as 'all' | 'photos_only',
  },
};
