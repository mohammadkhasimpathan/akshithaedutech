import { createBrowserClient } from '@supabase/ssr';
import { getPublicEnv } from './env';

/**
 * Creates an anonymous Supabase client safe for use in browser contexts.
 * Uses only public anon credentials.
 */
export function createClient() {
  const env = getPublicEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
