import { describe, it, expect, vi } from 'vitest';
import { verifyJobEligibilityForApplication } from '@/lib/data/jobs';
import { generateSecureResumeDownloadUrl } from '@/lib/data/resumes';
import type { SupabaseClient } from '@supabase/supabase-js';

// MOCKED SUPABASE TESTS
// Notice: These tests utilize simulated Supabase client responses to verify data access helper logic
// without requiring a live remote PostgreSQL instance or Docker container.

describe('Phase 3: Server Data Access Helpers (Mocked Supabase Client)', () => {
  const dummyJobId = '44444444-4444-4444-4444-444444444444';
  const dummyAdminId = '55555555-5555-5555-5555-555555555555';

  describe('verifyJobEligibilityForApplication', () => {
    it('should return eligible = true for a published job with future deadline', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: dummyJobId,
                  status: 'published',
                  application_deadline: new Date(Date.now() + 86400000).toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await verifyJobEligibilityForApplication(mockSupabase, dummyJobId);
      expect(result.eligible).toBe(true);
      expect(result.job).toBeDefined();
    });

    it('should return eligible = false if job status is draft or closed', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: dummyJobId,
                  status: 'closed',
                  application_deadline: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await verifyJobEligibilityForApplication(mockSupabase, dummyJobId);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not open for new applications');
    });

    it('should return eligible = false if application deadline has passed', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: dummyJobId,
                  status: 'published',
                  application_deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                },
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await verifyJobEligibilityForApplication(mockSupabase, dummyJobId);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('deadline for submitting applications for this position has passed');
    });

    it('should return eligible = false if job does not exist', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await verifyJobEligibilityForApplication(mockSupabase, 'non-existent-id');
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('does not exist');
    });
  });

  describe('generateSecureResumeDownloadUrl', () => {
    const validResumePath = 'resumes/job-1/app-1/resume-uuid.pdf';

    it('should deny signed URL generation if requesting user is not in admin_profiles', async () => {
      const mockAdminClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null, // User is not an admin
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await generateSecureResumeDownloadUrl(mockAdminClient, validResumePath, dummyAdminId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('should deny signed URL generation if admin user is inactive', async () => {
      const mockAdminClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: dummyAdminId, role: 'admin', is_active: false },
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await generateSecureResumeDownloadUrl(mockAdminClient, validResumePath, dummyAdminId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied: The requesting user is not an active administrator');
    });

    it('should generate authorized short-lived signed URL when requester is an active admin', async () => {
      const mockAdminClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: dummyAdminId, role: 'admin', is_active: true },
                error: null,
              }),
            }),
          }),
        }),
        storage: {
          from: vi.fn().mockReturnValue({
            createSignedUrl: vi.fn().mockResolvedValue({
              data: { signedUrl: 'https://supabase.co/storage/v1/object/sign/resumes/job-1/app-1/resume-uuid.pdf?token=xyz' },
              error: null,
            }),
          }),
        },
      } as unknown as SupabaseClient;

      const result = await generateSecureResumeDownloadUrl(mockAdminClient, validResumePath, dummyAdminId, 60);
      expect(result.success).toBe(true);
      expect(result.signedUrl).toContain('token=xyz');
      expect(result.expiresInSeconds).toBe(60);
    });

    it('should reject invalid resume storage paths not starting with resumes/', async () => {
      const mockAdminClient = {} as SupabaseClient;
      const result = await generateSecureResumeDownloadUrl(mockAdminClient, 'malicious-path/file.pdf', dummyAdminId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid resume storage path');
    });
  });
});
