import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for public reads.
 *
 * `cookies()` cannot be called inside a cache scope, so cached queries must not
 * depend on the request session. Gallery data is public, so an anonymous client
 * is both correct and cacheable.
 *
 * Returns `null` when the environment is not configured.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
