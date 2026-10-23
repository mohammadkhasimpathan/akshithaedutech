import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getPublicEnv, getServerEnv } from '@/lib/supabase/env';

describe('Phase 3: Environment Configuration & Secret Protection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate public environment variables when properly configured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-anon-key-with-sufficient-length';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

    const env = getPublicEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://valid-project.supabase.co');
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('valid-anon-key-with-sufficient-length');
  });

  it('should validate server environment variables when service role key is present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-anon-key-with-sufficient-length';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'valid-service-role-key-secret-12345';

    const env = getServerEnv();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe('valid-service-role-key-secret-12345');
  });

  it('CRITICAL: should report missing variable names WITHOUT leaking credential values in error messages', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'super-secret-service-role-value';

    try {
      getPublicEnv();
      expect.fail('Should have thrown an error');
    } catch (err: unknown) {
      const message = (err as Error).message;
      expect(message).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(message).not.toContain('super-secret-service-role-value');
    }
  });

  it('should block getServerEnv if attempted in a browser context', () => {
    // Simulate browser window
    (window as unknown as { __SIMULATE_BROWSER__?: boolean }).__SIMULATE_BROWSER__ = true;

    expect(() => getServerEnv()).toThrowError(/Security violation: Attempted to access server environment variables/i);

    delete (window as unknown as { __SIMULATE_BROWSER__?: boolean }).__SIMULATE_BROWSER__;
  });
});
