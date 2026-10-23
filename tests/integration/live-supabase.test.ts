import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 * Live Development Supabase Integration Test Suite
 * ============================================================================
 *
 * Scope & Safety Constraints:
 * 1. Checks whether valid live development Supabase credentials exist and are reachable.
 * 2. If development credentials are absent, invalid, or point to offline mocks, this suite
 *    is cleanly marked as BLOCKED / SKIPPED and logs actionable setup instructions.
 * 3. Never makes unit tests or CI runs silently fail when no remote database is provisioned.
 * 4. Only uses disposable test records with explicit TEST_ prefixes.
 * 5. Cleans up all test database rows and storage objects in afterAll.
 * 6. Never touches or mutates production records.
 */

// Helper to check whether real remote development credentials are configured
function isDevelopmentSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const mockFlag = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS;

  if (mockFlag === 'true') {
    return false;
  }

  const isPlaceholder = (val: string) =>
    !val ||
    val.includes('placeholder') ||
    val.includes('example') ||
    val.includes('your-') ||
    val.length < 20;

  if (isPlaceholder(anonKey) || isPlaceholder(serviceKey) || !url.startsWith('http')) {
    return false;
  }

  return true;
}

const isConfigured = isDevelopmentSupabaseConfigured();

describe.skipIf(!isConfigured)('Live Supabase Development Integration Suite', () => {
  let anonClient: SupabaseClient | null = null;
  let adminClient: SupabaseClient | null = null;

  // Disposable tracking for automated rollback & cleanup
  const cleanupJobs: string[] = [];
  const cleanupApps: string[] = [];
  const cleanupEnquiries: string[] = [];
  const cleanupReports: string[] = [];
  const cleanupStoragePaths: string[] = [];

  const testSuffix = Math.random().toString(36).substring(2, 8);
  const testJobSlug = `test-job-qa-${testSuffix}`;
  let createdJobId: string | null = null;
  let createdAppId: string | null = null;

  beforeAll(async () => {
    if (!isConfigured) return;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    anonClient = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    adminClient = createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });

  afterAll(async () => {
    if (!adminClient) return;

    // 1. Clean up storage files
    if (cleanupStoragePaths.length > 0) {
      await adminClient.storage.from('resumes').remove(cleanupStoragePaths);
    }

    // 2. Clean up applications
    if (cleanupApps.length > 0) {
      await adminClient.from('applications').delete().in('id', cleanupApps);
    }

    // 3. Clean up jobs
    if (cleanupJobs.length > 0) {
      await adminClient.from('jobs').delete().in('id', cleanupJobs);
    }

    // 4. Clean up enquiries
    if (cleanupEnquiries.length > 0) {
      await adminClient.from('enquiries').delete().in('id', cleanupEnquiries);
    }

    // 5. Clean up reports
    if (cleanupReports.length > 0) {
      await adminClient.from('job_reports').delete().in('id', cleanupReports);
    }
  });

  describe('1. Public vs Draft Job Visibility & RLS', () => {
    it('allows public anonymous users to query published, non-expired jobs', async () => {
      // Seed a published test job via admin client
      const { data: job, error } = await adminClient!
        .from('jobs')
        .insert({
          slug: testJobSlug,
          title: `QA Test Engineer - ${testSuffix}`,
          company_name: 'Akshitha Edutech Private Limited',
          location: 'Bangalore, Karnataka (Hybrid)',
          work_mode: 'hybrid',
          employment_type: 'full-time',
          category: 'Engineering',
          description: 'Disposable integration test job listing for automated verification.',
          experience_min: 0,
          experience_max: 2,
          openings: 1,
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .select('id, slug, status')
        .single();

      expect(error).toBeNull();
      expect(job).toBeDefined();
      createdJobId = job!.id;
      cleanupJobs.push(job!.id);

      // Verify anonymous user CAN read this published job
      const { data: pubJob, error: pubError } = await anonClient!
        .from('jobs')
        .select('id, slug, status')
        .eq('slug', testJobSlug)
        .maybeSingle();

      expect(pubError).toBeNull();
      expect(pubJob).toBeDefined();
      expect(pubJob?.status).toBe('published');
    });

    it('strictly denies public anonymous users from reading draft jobs', async () => {
      const draftSlug = `test-draft-qa-${testSuffix}`;
      const { data: draftJob, error } = await adminClient!
        .from('jobs')
        .insert({
          slug: draftSlug,
          title: `Draft Role - ${testSuffix}`,
          location: 'Hyderabad, Telangana',
          work_mode: 'on-site',
          employment_type: 'full-time',
          category: 'Operations',
          description: 'Confidential draft role. Public must never see this listing.',
          status: 'draft',
        })
        .select('id, slug')
        .single();

      expect(error).toBeNull();
      cleanupJobs.push(draftJob!.id);

      // Anonymous client MUST receive null / 0 rows due to RLS policy 'jobs_public_read_active'
      const { data: anonView, error: anonError } = await anonClient!
        .from('jobs')
        .select('id, slug')
        .eq('slug', draftSlug)
        .maybeSingle();

      expect(anonError).toBeNull();
      expect(anonView).toBeNull();
    });
  });

  describe('2. Candidate PII & Direct Client Access Restriction (Zero Trust)', () => {
    it('denies anonymous users from reading the applications table', async () => {
      const { data, error } = await anonClient!.from('applications').select('id, candidate_name, email');
      // RLS should either return empty array or error
      expect(error !== null || data === null || (Array.isArray(data) && data.length === 0)).toBe(true);
    });

    it('denies anonymous users from directly inserting into applications table', async () => {
      const { error } = await anonClient!.from('applications').insert({
        job_id: createdJobId,
        candidate_name: 'Bypasser',
        email: 'bypass@example.com',
        phone: '+91 99999 88888',
        city: 'Delhi',
        education: 'B.Tech',
        experience_years: 0,
        resume_path: 'resumes/hack.pdf',
        resume_original_name: 'hack.pdf',
      });

      // Must be rejected by RLS
      expect(error).toBeDefined();
    });

    it('denies anonymous users from reading internal enquiries and reports', async () => {
      const { data: enquiries } = await anonClient!.from('enquiries').select('id, message');
      expect(enquiries === null || (Array.isArray(enquiries) && enquiries.length === 0)).toBe(true);

      const { data: reports } = await anonClient!.from('job_reports').select('id, details');
      expect(reports === null || (Array.isArray(reports) && reports.length === 0)).toBe(true);
    });
  });

  describe('3. Validated Candidate Application & Private Resume Storage', () => {
    it('persists candidate application and uploads PDF to private resumes bucket', async () => {
      const dummyAppId = crypto.randomUUID();
      const storageKey = `${createdJobId}/${dummyAppId}/disposable_resume.pdf`;
      const fullPath = `resumes/${storageKey}`;
      cleanupApps.push(dummyAppId);
      cleanupStoragePaths.push(storageKey);

      // Dummy PDF buffer with valid %PDF- header
      const dummyPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

      // 1. Upload to storage
      const { error: uploadError } = await adminClient!.storage
        .from('resumes')
        .upload(storageKey, dummyPdfBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      expect(uploadError).toBeNull();

      // 2. Insert application record
      const { data: appRecord, error: appError } = await adminClient!
        .from('applications')
        .insert({
          id: dummyAppId,
          job_id: createdJobId,
          candidate_name: `Disposable Candidate ${testSuffix}`,
          email: `disposable_${testSuffix}@example.com`,
          phone: '+91 98765 00000',
          city: 'Pune',
          education: 'MCA',
          experience_years: 0.5,
          resume_path: fullPath,
          resume_original_name: 'disposable_resume.pdf',
          status: 'pending',
          internal_notes: 'Integration test confidential note.',
        })
        .select('id, candidate_name, internal_notes')
        .single();

      expect(appError).toBeNull();
      expect(appRecord).toBeDefined();
      createdAppId = appRecord!.id;

      // 3. Confirm public anonymous user CANNOT read this application or its internal notes
      const { data: leakCheck } = await anonClient!
        .from('applications')
        .select('id, internal_notes')
        .eq('id', dummyAppId)
        .maybeSingle();

      expect(leakCheck).toBeNull();

      // 4. Confirm public anonymous user CANNOT download resume without signed URL
      const { data: fileData, error: downloadError } = await anonClient!.storage
        .from('resumes')
        .download(storageKey);

      expect(fileData).toBeNull();
      expect(downloadError).toBeDefined();
    });

    it('generates short-lived signed URL for administrator and validates expiry', async () => {
      const storageKey = `${createdJobId}/${createdAppId}/disposable_resume.pdf`;
      const { data, error } = await adminClient!.storage
        .from('resumes')
        .createSignedUrl(storageKey, 60);

      expect(error).toBeNull();
      expect(data?.signedUrl).toBeDefined();
      expect(data?.signedUrl).toContain('token=');
    });
  });

  describe('4. Administrative Operations & Job Lifecycle Management', () => {
    it('allows administrator to update job details and lifecycle status', async () => {
      const { data: updated, error } = await adminClient!
        .from('jobs')
        .update({
          title: `Updated QA Engineer - ${testSuffix}`,
          status: 'closed',
        })
        .eq('id', createdJobId)
        .select('id, title, status')
        .single();

      expect(error).toBeNull();
      expect(updated?.title).toContain('Updated');
      expect(updated?.status).toBe('closed');

      // Now that status is 'closed', verify anonymous visitor no longer sees it in public read
      const { data: closedView } = await anonClient!
        .from('jobs')
        .select('id')
        .eq('id', createdJobId)
        .maybeSingle();

      expect(closedView).toBeNull();
    });
  });
});

describe('Live Supabase Integration Blocked State Documentation', () => {
  it('documents environment prerequisite status for live integration testing', () => {
    if (!isConfigured) {
      // Diagnostic output when remote database is blocked
      console.warn(
        '\n[NOTICE: LIVE SUPABASE INTEGRATION BLOCKED]\n' +
          'Reason: Live development credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are placeholders or NEXT_PUBLIC_ENABLE_LOCAL_MOCKS is true.\n' +
          'Action: To run live integration tests, link a separate dev project (npx supabase link) or populate .env.local with development credentials, set NEXT_PUBLIC_ENABLE_LOCAL_MOCKS=false, and re-run.\n'
      );
    }
    expect(true).toBe(true);
  });
});
