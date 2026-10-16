import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClientInstance) {
    const key = config.supabase.serviceRoleKey !== 'placeholder-service-role-key'
      ? config.supabase.serviceRoleKey
      : config.supabase.anonKey;

    supabaseClientInstance = createClient(config.supabase.url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClientInstance;
}

export const isSupabaseConfigured = (): boolean => {
  return (
    config.supabase.url !== 'https://placeholder.supabase.co' &&
    config.supabase.url.includes('.supabase.co') &&
    config.supabase.serviceRoleKey !== 'placeholder-service-role-key'
  );
};
