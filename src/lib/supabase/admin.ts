import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './env';

/**
 * Creates an elevated Supabase service-role client for server-only operations.
 * CRITICAL SECURITY CONSTRAINTS:
 * 1. NEVER import this into Client Components or modules accessible from the browser.
 * 2. Enforced at build-time via 'server-only'.
 * 3. Never return this client or service-role credentials in client responses.
 */
export function createAdminClient() {
  const env = getServerEnv();

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
