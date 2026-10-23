import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, memoryStore } from '@/lib/security/rate-limiter';
import { adminLogin } from '@/app/actions/admin-auth-actions';
import { getPublishedJobs } from '@/lib/data/jobs';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import nextConfig from '@/../next.config';

describe('Phase 6: Final Release Audit & Security Hardening Tests', () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  // ==========================================================================
  // 1. Admin Login Rate Limiting & Anti-Brute-Force
  // ==========================================================================
  describe('Admin Login Anti-Brute-Force Protection', () => {
    it('allows up to 5 login attempts and blocks the 6th attempt within the rate limit window', async () => {
      const clientIp = '192.168.1.100';

      // 5 allowed attempts
      for (let i = 1; i <= 5; i++) {
        const check = await checkRateLimit(clientIp, 'login');
        expect(check.allowed).toBe(true);
        expect(check.remaining).toBe(5 - i);
      }

      // 6th attempt blocked
      const blockedCheck = await checkRateLimit(clientIp, 'login');
      expect(blockedCheck.allowed).toBe(false);
      expect(blockedCheck.remaining).toBe(0);
    });

    it('returns rate limit error from adminLogin Server Action when threshold exceeded', async () => {
      // Consume all 5 tokens
      const clientIp = '127.0.0.1';
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(clientIp, 'login');
      }

      const formData = new FormData();
      formData.set('email', 'admin@akshithaedutech.com');
      formData.set('password', 'AdminPass123!');

      const res = await adminLogin(formData);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Too many failed login attempts');
    });
  });

  // ==========================================================================
  // 2. Robots & Sitemap Search Engine Integrity
  // ==========================================================================
  describe('SEO & Sitemap Data Exposure Safeguards', () => {
    it('robots.txt disallows administrative and API routes', () => {
      const config = robots();
      const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;

      expect(rules.disallow).toContain('/admin/');
      expect(rules.disallow).toContain('/admin');
      expect(rules.disallow).toContain('/api/');
      expect(rules.allow).toContain('/jobs');
      expect(rules.allow).toContain('/');
    });

    it('sitemap strictly includes published jobs and excludes draft/closed/archived positions', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      // Verify active published jobs are present
      expect(urls.some((u) => u.includes('graduate-trainee-software-engineer'))).toBe(true);
      expect(urls.some((u) => u.includes('senior-full-stack-developer'))).toBe(true);

      // Verify draft and closed positions are NEVER indexed
      expect(urls.some((u) => u.includes('lead-ui-ux-designer-draft'))).toBe(false);
      expect(urls.some((u) => u.includes('operations-associate-closed'))).toBe(false);

      // Verify admin paths are NEVER present in public sitemap
      expect(urls.some((u) => u.includes('/admin'))).toBe(false);
      expect(urls.some((u) => u.includes('/api'))).toBe(false);
    });
  });

  // ==========================================================================
  // 3. HTTP Security Headers
  // ==========================================================================
  describe('HTTP Security Headers Verification', () => {
    it('configures essential defense-in-depth headers in next.config.ts', async () => {
      expect(typeof nextConfig.headers).toBe('function');

      const headersConfig = await nextConfig.headers!();
      const allHeaders = headersConfig[0].headers;

      const headerMap = new Map(allHeaders.map((h: { key: string; value: string }) => [h.key, h.value]));

      expect(headerMap.get('X-Frame-Options')).toBe('DENY');
      expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=63072000');
      expect(headerMap.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    });
  });

  // ==========================================================================
  // 4. Data Exposure & Candidate PII Isolation
  // ==========================================================================
  describe('Public API & Data Access PII Isolation', () => {
    it('ensures getPublishedJobs() exposes no applicant PII or internal notes', async () => {
      const { jobs } = await getPublishedJobs(null);

      jobs.forEach((job) => {
        const record = job as unknown as Record<string, unknown>;
        // Assert absence of sensitive candidate or review fields
        expect(record.candidate_name).toBeUndefined();
        expect(record.email).toBeUndefined();
        expect(record.phone).toBeUndefined();
        expect(record.internal_notes).toBeUndefined();
        expect(record.resume_path).toBeUndefined();
      });
    });
  });

  // ==========================================================================
  // 5. Anti-Silent-Mock Substitution Verification (Requirement 7)
  // ==========================================================================
  describe('Anti-Silent-Mock Substitution in Non-Mock Mode', () => {
    it('returns empty results on database errors when NEXT_PUBLIC_ENABLE_LOCAL_MOCKS is false', async () => {
      const originalFlag = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS;
      process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS = 'false';

      try {
        const errorSupabase = {
          from: () => ({
            select: () => ({
              eq: () => ({
                or: () => ({
                  order: () => ({
                    order: () => ({
                      range: () => Promise.resolve({ data: null, error: { message: 'Database connection failed' }, count: 0 }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        } as unknown as import('@supabase/supabase-js').SupabaseClient;

        const { getPublishedJobs } = await import('@/lib/data/jobs');
        const result = await getPublishedJobs(errorSupabase);

        // MUST be empty — must NEVER return filterMockJobs()
        expect(result.jobs).toEqual([]);
        expect(result.count).toBe(0);
      } finally {
        process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS = originalFlag;
      }
    });

    it('returns null on database errors for getPublishedJobBySlug when mock mode is false', async () => {
      const originalFlag = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS;
      process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS = 'false';

      try {
        const errorSupabase = {
          from: () => ({
            select: () => ({
              eq: () => ({
                eq: () => ({
                  or: () => ({
                    maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Postgres query error' } }),
                  }),
                }),
              }),
            }),
          }),
        } as unknown as import('@supabase/supabase-js').SupabaseClient;

        const { getPublishedJobBySlug } = await import('@/lib/data/jobs');
        const job = await getPublishedJobBySlug(errorSupabase, 'graduate-trainee-software-engineer');

        // MUST be null — must NEVER fall back to MOCK_JOBS
        expect(job).toBeNull();
      } finally {
        process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS = originalFlag;
      }
    });
  });
});
