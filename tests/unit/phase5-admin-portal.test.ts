import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeRedirectPath,
  getCurrentAdminProfile,
  requireAdminAuth,
  ADMIN_SESSION_COOKIE,
} from '@/lib/auth/admin-auth';
import {
  adminLogin,
  adminLogout,
} from '@/app/actions/admin-auth-actions';
import {
  createAdminJob,
  updateAdminJob,
  updateAdminJobStatus,
  deleteAdminJob,
} from '@/app/actions/admin-job-actions';
import {
  updateApplicationReview,
  getSecureResumeDownloadUrlAction,
} from '@/app/actions/admin-application-actions';
import {
  updateEnquiryStatusAction,
  updateJobReportStatusAction,
} from '@/app/actions/admin-inbox-actions';
import {
  getAdminDashboardMetrics,
  getAdminJobs,
  getAdminApplications,
  getAdminEnquiries,
  getAdminReports,
} from '@/lib/data/admin';
import {
  resetMockJobs,
  resetMockApplications,
  resetMockEnquiries,
  resetMockReports,
  getMockJobs,
  getMockApplications,
  getMockEnquiries,
  getMockReports,
} from '@/lib/data/mock-data';
import { cookies } from 'next/headers';

describe('Phase 5: Secure Admin Portal & RBAC Operations', () => {
  beforeEach(async () => {
    // Reset mock store state
    resetMockJobs();
    resetMockApplications();
    resetMockEnquiries();
    resetMockReports();

    // Clear session cookies
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
  });

  // ==========================================================================
  // 1. Open Redirect Prevention & Route Sanitization
  // ==========================================================================
  describe('Open Redirect Defense', () => {
    it('allows valid internal administrative routes', () => {
      expect(sanitizeRedirectPath('/admin')).toBe('/admin');
      expect(sanitizeRedirectPath('/admin/jobs')).toBe('/admin/jobs');
      expect(sanitizeRedirectPath('/admin/applications?status=pending')).toBe(
        '/admin/applications?status=pending'
      );
      expect(sanitizeRedirectPath('/admin/enquiries/123')).toBe('/admin/enquiries/123');
    });

    it('neutralizes external URL schemes and protocol-relative bypasses', () => {
      expect(sanitizeRedirectPath('https://evil.attacker.com')).toBe('/admin');
      expect(sanitizeRedirectPath('http://evil.attacker.com')).toBe('/admin');
      expect(sanitizeRedirectPath('//evil.attacker.com')).toBe('/admin');
      expect(sanitizeRedirectPath('/\\evil.attacker.com')).toBe('/admin');
      expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/admin');
      expect(sanitizeRedirectPath('/admin%2f%2fevil.com')).toBe('/admin');
      expect(sanitizeRedirectPath('')).toBe('/admin');
      expect(sanitizeRedirectPath(null)).toBe('/admin');
    });
  });

  // ==========================================================================
  // 2. Authentication & Server-Side Authorization Guard
  // ==========================================================================
  describe('Admin Authentication & RBAC Verification', () => {
    it('blocks login with invalid credentials', async () => {
      const formData = new FormData();
      formData.set('email', 'admin@akshithaedutech.com');
      formData.set('password', 'WrongPassword123');

      const result = await adminLogin(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid administrative email or password');
    });

    it('blocks login for inactive administrator accounts even with valid password', async () => {
      const formData = new FormData();
      formData.set('email', 'inactive@akshithaedutech.com');
      formData.set('password', 'AdminPass123!');

      const result = await adminLogin(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('deactivated');
    });

    it('authenticates active lead administrator and returns safe redirect', async () => {
      const formData = new FormData();
      formData.set('email', 'admin@akshithaedutech.com');
      formData.set('password', 'AdminPass123!');
      formData.set('redirect', '/admin/jobs');

      const result = await adminLogin(formData);
      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe('/admin/jobs');
      expect(result.admin?.role).toBe('super_admin');

      // Verify server session verification
      const profile = await getCurrentAdminProfile();
      expect(profile).not.toBeNull();
      expect(profile?.email).toBe('admin@akshithaedutech.com');
      expect(profile?.is_active).toBe(true);
    });

    it('enforces requireAdminAuth() throwing UNAUTHORIZED when no session exists', async () => {
      await expect(requireAdminAuth()).rejects.toThrow(/UNAUTHORIZED/);
    });

    it('enforces role-based permission checks with requireAdminAuth()', async () => {
      // Log in as content editor
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, 'editor@akshithaedutech.com');

      // Editor role allowed
      const profile = await requireAdminAuth(['super_admin', 'editor']);
      expect(profile.role).toBe('editor');

      // Super admin only action should be rejected
      await expect(requireAdminAuth(['super_admin'])).rejects.toThrow(/FORBIDDEN/);
    });

    it('terminates session cleanly on logout', async () => {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, 'admin@akshithaedutech.com');

      const logoutRes = await adminLogout();
      expect(logoutRes.success).toBe(true);
      expect(logoutRes.redirectTo).toBe('/admin/login');

      // Session should be cleared
      const profile = await getCurrentAdminProfile();
      expect(profile).toBeNull();
    });
  });

  // ==========================================================================
  // 3. Job Management & Application History Preservation
  // ==========================================================================
  describe('Job Lifecycle & Management Actions', () => {
    beforeEach(async () => {
      // Authenticate as lead admin for management mutations
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, 'admin@akshithaedutech.com');
    });

    it('rejects job creation with invalid schema fields', async () => {
      const invalidPayload = {
        title: 'Hi', // Too short
        slug: 'invalid slug with spaces',
        description: 'short',
        experience_min: 5,
        experience_max: 2, // Max < Min
        status: 'draft',
      };

      const result = await createAdminJob(invalidPayload);
      expect(result.success).toBe(false);
      expect(result.fieldErrors).toBeDefined();
    });

    it('rejects duplicate job slug collision', async () => {
      const duplicatePayload = {
        title: 'New Position',
        slug: 'graduate-trainee-software-engineer', // Already exists in mock data
        company_name: 'Akshitha Edutech Private Limited',
        location: 'Bengaluru, Karnataka',
        work_mode: 'hybrid',
        employment_type: 'full-time',
        category: 'Engineering',
        description: 'Comprehensive role description with more than twenty characters.',
        responsibilities: ['Write code'],
        qualifications: ['B.Tech'],
        skills: ['TypeScript'],
        experience_min: 0,
        experience_max: 1,
        openings: 2,
        status: 'draft',
      };

      const result = await createAdminJob(duplicatePayload);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('successfully creates, queries, and updates a new job posting', async () => {
      const newJobPayload = {
        title: 'DevOps & Cloud Engineer',
        slug: 'devops-cloud-engineer-2026',
        company_name: 'Akshitha Edutech Private Limited',
        location: 'Bengaluru, Karnataka',
        work_mode: 'on-site' as const,
        employment_type: 'full-time' as const,
        category: 'Infrastructure',
        description: 'Architecting scalable Docker, Kubernetes, and PostgreSQL cloud infrastructures.',
        responsibilities: ['Manage AWS ECS clusters', 'Implement automated CI/CD pipelines'],
        qualifications: ['2+ years cloud engineering experience', 'Strong Docker and Linux knowledge'],
        skills: ['Docker', 'AWS', 'Linux', 'PostgreSQL'],
        experience_min: 2,
        experience_max: 5,
        salary_min: 1000000,
        salary_max: 1500000,
        openings: 2,
        status: 'published' as const,
        featured: true,
      };

      const createRes = await createAdminJob(newJobPayload);
      expect(createRes.success).toBe(true);
      expect(createRes.job?.slug).toBe('devops-cloud-engineer-2026');
      expect(createRes.job?.published_at).not.toBeNull();

      // Verify job is now retrievable in getAdminJobs
      const { jobs } = await getAdminJobs({ search: 'DevOps' });
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].title).toBe('DevOps & Cloud Engineer');

      // Update the job
      const updateRes = await updateAdminJob(createRes.job!.id, {
        ...newJobPayload,
        openings: 5,
      });
      expect(updateRes.success).toBe(true);
      expect(updateRes.job?.openings).toBe(5);
    });

    it('transitions job status lifecycle', async () => {
      const jobs = getMockJobs();
      const targetJob = jobs[0];

      const statusRes = await updateAdminJobStatus(targetJob.id, 'closed');
      expect(statusRes.success).toBe(true);

      const updated = getMockJobs().find((j) => j.id === targetJob.id);
      expect(updated?.status).toBe('closed');
    });

    it('strictly prevents job deletion when candidate applications exist (ON DELETE RESTRICT)', async () => {
      // First job (Graduate Trainee) has applications in mock data
      const jobsWithApps = getMockJobs()[0];
      const apps = getMockApplications().filter((a) => a.job_id === jobsWithApps.id);
      expect(apps.length).toBeGreaterThan(0);

      const deleteRes = await deleteAdminJob(jobsWithApps.id);
      expect(deleteRes.success).toBe(false);
      expect(deleteRes.error).toContain('Cannot delete this job posting because');
      expect(deleteRes.error).toContain('candidate application(s) are associated with it');

      // Job should still exist
      expect(getMockJobs().some((j) => j.id === jobsWithApps.id)).toBe(true);
    });

    it('allows job deletion when no candidate applications exist', async () => {
      // Create a temporary job without applications
      const tempJob = {
        title: 'Temporary Unused Role',
        slug: 'temp-unused-role',
        company_name: 'Akshitha Edutech Private Limited',
        location: 'Remote',
        work_mode: 'remote' as const,
        employment_type: 'contract' as const,
        category: 'Design',
        description: 'Temporary position with more than twenty characters of description text.',
        responsibilities: ['Design'],
        qualifications: ['Portfolio'],
        skills: ['Figma'],
        experience_min: 1,
        experience_max: 3,
        openings: 1,
        status: 'draft' as const,
      };

      const created = await createAdminJob(tempJob);
      expect(created.success).toBe(true);

      const deleteRes = await deleteAdminJob(created.job!.id);
      expect(deleteRes.success).toBe(true);
      expect(getMockJobs().some((j) => j.id === created.job!.id)).toBe(false);
    });
  });

  // ==========================================================================
  // 4. Candidate Applications & Secure Resume Access
  // ==========================================================================
  describe('Application Management & Secure Document Access', () => {
    beforeEach(async () => {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, 'admin@akshithaedutech.com');
    });

    it('updates application status and private internal audit notes', async () => {
      const app = getMockApplications()[0];

      const res = await updateApplicationReview(
        app.id,
        'shortlisted',
        'Strong academic background; scheduled for technical interview.'
      );
      expect(res.success).toBe(true);

      const updated = getMockApplications().find((a) => a.id === app.id);
      expect(updated?.status).toBe('shortlisted');
      expect(updated?.internal_notes).toContain('Strong academic background');
    });

    it('rejects invalid application status', async () => {
      const app = getMockApplications()[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await updateApplicationReview(app.id, 'hired_invalid' as any);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid status');
    });

    it('generates authorized short-lived resume download URL for active admin', async () => {
      const app = getMockApplications()[0];

      const res = await getSecureResumeDownloadUrlAction(app.id);
      expect(res.success).toBe(true);
      expect(res.signedUrl).toBeDefined();
      expect(res.fileName).toBe(app.resume_original_name);
      expect(res.expiresInSeconds).toBe(60);
    });

    it('denies resume download when caller is unauthenticated', async () => {
      // Clear admin session
      const cookieStore = await cookies();
      cookieStore.delete(ADMIN_SESSION_COOKIE);

      const app = getMockApplications()[0];
      const res = await getSecureResumeDownloadUrlAction(app.id);
      expect(res.success).toBe(false);
      expect(res.error?.toLowerCase()).toContain('unauthorized');
    });

    it('rejects resume download for non-existent application', async () => {
      const res = await getSecureResumeDownloadUrlAction('non-existent-uuid-1234');
      expect(res.success).toBe(false);
      expect(res.error).toContain('not found');
    });
  });

  // ==========================================================================
  // 5. Enquiries & Job Issue Reports Triage
  // ==========================================================================
  describe('Enquiries & Job Reports Triage Inboxes', () => {
    beforeEach(async () => {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, 'admin@akshithaedutech.com');
    });

    it('triages candidate enquiry with status and internal notes', async () => {
      const enquiry = getMockEnquiries()[0];

      const res = await updateEnquiryStatusAction(
        enquiry.id,
        'resolved',
        'Counseled candidate regarding 2026 hiring calendar and eligibility.'
      );
      expect(res.success).toBe(true);

      const updated = getMockEnquiries().find((e) => e.id === enquiry.id);
      expect(updated?.status).toBe('resolved');
      expect(updated?.internal_notes).toContain('Counseled candidate');
    });

    it('triages job report determination', async () => {
      const report = getMockReports()[0];

      const res = await updateJobReportStatusAction(report.id, 'reviewed');
      expect(res.success).toBe(true);

      const updated = getMockReports().find((r) => r.id === report.id);
      expect(updated?.status).toBe('reviewed');
    });
  });

  // ==========================================================================
  // 6. Administrative Dashboard Metrics Aggregation
  // ==========================================================================
  describe('Dashboard Metrics Calculation', () => {
    it('aggregates live operational counts correctly', async () => {
      const metrics = await getAdminDashboardMetrics();

      expect(metrics.jobs.total).toBe(getMockJobs().length);
      expect(metrics.jobs.published).toBe(
        getMockJobs().filter((j) => j.status === 'published').length
      );
      expect(metrics.applications.total).toBe(getMockApplications().length);
      expect(metrics.enquiries.total).toBe(getMockEnquiries().length);
      expect(metrics.reports.total).toBe(getMockReports().length);
      expect(Array.isArray(metrics.recentActivity)).toBe(true);
      expect(metrics.recentActivity.length).toBeLessThanOrEqual(10);
    });

    it('supports paginated and filtered queries', async () => {
      const jobsRes = await getAdminJobs({ limit: 2, page: 1 });
      expect(jobsRes.jobs.length).toBeLessThanOrEqual(2);
      expect(jobsRes.totalPages).toBeGreaterThan(0);

      const appsRes = await getAdminApplications({ limit: 2, page: 1 });
      expect(appsRes.applications.length).toBeLessThanOrEqual(2);

      const enqRes = await getAdminEnquiries({ status: 'new' });
      expect(enqRes.enquiries.every((e) => e.status === 'new')).toBe(true);

      const repRes = await getAdminReports({ status: 'pending' });
      expect(repRes.reports.every((r) => r.status === 'pending')).toBe(true);
    });
  });
});
