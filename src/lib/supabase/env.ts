import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be provided'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_ENABLE_LOCAL_MOCKS: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY is required for server admin operations'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates public environment variables without leaking credentials or secret values in errors.
 */
export function getPublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ENABLE_LOCAL_MOCKS: process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS,
  });

  if (!result.success) {
    // Collect field names only — NEVER print actual values
    const missingKeys = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Configuration error: Invalid or missing public environment variables: [${missingKeys}]`);
  }

  return result.data;
}

/**
 * Validates server environment variables (including SERVICE_ROLE_KEY).
 * Throws a sanitized error listing missing variable names without exposing key contents.
 */
export function getServerEnv(): ServerEnv {
  if (
    typeof window !== 'undefined' &&
    (process.env.NODE_ENV !== 'test' ||
      (window as unknown as { __SIMULATE_BROWSER__?: boolean }).__SIMULATE_BROWSER__)
  ) {
    throw new Error('Security violation: Attempted to access server environment variables from the browser.');
  }

  const result = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ENABLE_LOCAL_MOCKS: process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!result.success) {
    const missingKeys = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Configuration error: Invalid or missing server environment variables: [${missingKeys}]`);
  }

  return result.data;
}
