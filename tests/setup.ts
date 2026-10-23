import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock server-only in Vitest jsdom test runner
vi.mock('server-only', () => ({}));

// Shared in-memory cookie jar across test calls
export const testCookieJar = new Map<string, { name: string; value: string }>();

// Environment defaults for Vitest test runner
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder_anon_key';
process.env.NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder_service_key';
process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS = 'true';

// Mock next/cache for Server Actions tested in jsdom
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

// Mock next/headers for server action testing outside live HTTP request loop
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(
    new Headers({
      'x-forwarded-for': '127.0.0.1',
      'user-agent': 'Vitest-Test-Runner',
    })
  ),
  cookies: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      get: vi.fn((name: string) => testCookieJar.get(name)),
      getAll: vi.fn(() => Array.from(testCookieJar.values())),
      set: vi.fn((name: string, value: string) =>
        testCookieJar.set(name, { name, value })
      ),
      delete: vi.fn((name: string) => testCookieJar.delete(name)),
    });
  }),
}));

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

