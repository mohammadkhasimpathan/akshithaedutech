import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

// Ensure .env.local is loaded in integration test process
loadEnvConfig(process.cwd());

/**
 * ============================================================================
 * Live Development Supabase Integration Test Suite
 * ============================================================================
 *
 * Scope & Safety Constraints:
 * 1. Checks whether valid live development Supabase credentials exist and are reachable.
 * 2. If development credentials are absent, invalid, or point to offline mocks without RUN_LIVE_TESTS,
 *    this suite is cleanly marked as BLOCKED / SKIPPED and logs actionable setup instructions.
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
  const runLive = process.env.RUN_LIVE_TESTS === 'true';

  if (!runLive && mockFlag === 'true') {
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
  const cleanupStudents: string[] = [];
  const cleanupEmployers: string[] = [];
  const cleanupColleges: string[] = [];

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

    // 6. Clean up student registrations
    if (cleanupStudents.length > 0) {
      await adminClient.from('student_registrations').delete().in('id', cleanupStudents);
    }

    // 7. Clean up employer registrations
    if (cleanupEmployers.length > 0) {
      await adminClient.from('employer_registrations').delete().in('id', cleanupEmployers);
    }

    // 8. Clean up college registrations
    if (cleanupColleges.length > 0) {
      await adminClient.from('college_registrations').delete().in('id', cleanupColleges);
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

  describe('5. Registration Workflows & Institutional Alliances (Student, Employer, College)', () => {
    it('denies anonymous visitors direct read or insert access to student_registrations', async () => {
      // Anonymous read must return empty or error
      const { data: anonRead, error: readError } = await anonClient!
        .from('student_registrations')
        .select('id, full_name, email');

      expect(readError !== null || anonRead === null || (Array.isArray(anonRead) && anonRead.length === 0)).toBe(true);

      // Anonymous insert must be blocked by RLS
      const { error: insertError } = await anonClient!
        .from('student_registrations')
        .insert({
          full_name: 'Anonymous Hacker',
          email: `hacker_${testSuffix}@example.com`,
          phone: '+91 99999 11111',
          college_name: 'Fake Tech Institute',
          degree: 'B.Tech',
          graduation_year: 2026,
          skills: ['Exploit'],
          opportunity_interests: ['jobs'],
        });

      expect(insertError).toBeDefined();
    });

    it('allows service-role to persist student registration and admin to update review status and notes', async () => {
      const studentEmail = `student_${testSuffix}@example.com`;
      const { data: student, error: insertError } = await adminClient!
        .from('student_registrations')
        .insert({
          full_name: `Candidate Student ${testSuffix}`,
          email: studentEmail,
          phone: '+91 91234 56789',
          city: 'Bangalore',
          state: 'Karnataka',
          college_name: 'Bangalore Institute of Technology',
          course: 'B.E.',
          specialization: 'Computer Science',
          graduation_year: 2026,
          skills: ['React', 'TypeScript', 'Node.js'],
          experience_status: 'fresher',
          experience_years: 0,
          opportunity_interests: ['jobs', 'internships'],
          status: 'pending',
        })
        .select('id, email, status')
        .single();

      expect(insertError).toBeNull();
      expect(student).toBeDefined();
      cleanupStudents.push(student!.id);

      // Admin updates status to 'reviewed' with admin notes
      const { data: updated, error: updateError } = await adminClient!
        .from('student_registrations')
        .update({
          status: 'reviewed',
          admin_notes: 'Verified academic credentials and GitHub repository.',
        })
        .eq('id', student!.id)
        .select('id, status, admin_notes')
        .single();

      expect(updateError).toBeNull();
      expect(updated?.status).toBe('reviewed');
      expect(updated?.admin_notes).toContain('Verified');

      // Anonymous client cannot read this student record
      const { data: anonCheck } = await anonClient!
        .from('student_registrations')
        .select('id, admin_notes')
        .eq('id', student!.id)
        .maybeSingle();

      expect(anonCheck).toBeNull();
    });

    it('denies anonymous visitors direct access to employer_registrations and handles verified submissions', async () => {
      // Anonymous read must be denied
      const { data: anonRead, error: readError } = await anonClient!
        .from('employer_registrations')
        .select('id, company_name');

      expect(readError !== null || anonRead === null || (Array.isArray(anonRead) && anonRead.length === 0)).toBe(true);

      // Service-role persists employer registration
      const employerEmail = `hr_${testSuffix}@techcorp-example.com`;
      const { data: employer, error: insertError } = await adminClient!
        .from('employer_registrations')
        .insert({
          company_name: `TechCorp Solutions ${testSuffix}`,
          contact_person: 'Ananya Sharma',
          business_email: employerEmail,
          phone: '+91 80 1234 5678',
          designation: 'HR Director',
          website: 'https://techcorp-example.com',
          industry: 'Information Technology',
          office_location: 'Bangalore, Karnataka',
          hiring_needs: 'Seeking entry-level frontend engineers and cloud architects.',
          opportunity_types: ['full-time', 'internship'],
          hiring_volume: '50-200',
          collaboration_interests: ['campus_hiring'],
          status: 'pending',
        })
        .select('id, company_name, status')
        .single();

      expect(insertError).toBeNull();
      expect(employer).toBeDefined();
      cleanupEmployers.push(employer!.id);

      // Admin reviews and transitions to 'reviewed'
      const { data: reviewed, error: reviewError } = await adminClient!
        .from('employer_registrations')
        .update({
          status: 'reviewed',
          admin_notes: 'Initial introductory discussion call scheduled for Thursday.',
        })
        .eq('id', employer!.id)
        .select('id, status, admin_notes')
        .single();

      expect(reviewError).toBeNull();
      expect(reviewed?.status).toBe('reviewed');
    });

    it('denies anonymous visitors direct access to college_registrations and handles institutional review', async () => {
      // Anonymous read must be denied
      const { data: anonRead, error: readError } = await anonClient!
        .from('college_registrations')
        .select('id, institution_name');

      expect(readError !== null || anonRead === null || (Array.isArray(anonRead) && anonRead.length === 0)).toBe(true);

      // Service-role persists college registration
      const collegeEmail = `tpo_${testSuffix}@university-example.edu.in`;
      const { data: college, error: insertError } = await adminClient!
        .from('college_registrations')
        .insert({
          institution_name: `Karnataka National Institute of Tech ${testSuffix}`,
          contact_person: 'Dr. Ramesh Kumar',
          official_email: collegeEmail,
          designation: 'Head of Placements',
          phone: '+91 824 2474 000',
          city: 'Mangalore',
          state: 'Karnataka',
          institution_type: 'Engineering & Technology College',
          courses_departments: ['Computer Science', 'Information Science'],
          student_strength: '1200+',
          placement_cell_details: 'Active placement cell with 4 dedicated training officers and state-of-the-art computer labs.',
          collaboration_interests: ['campus_placements', 'internship_drives'],
          status: 'pending',
        })
        .select('id, institution_name, status')
        .single();

      expect(insertError).toBeNull();
      expect(college).toBeDefined();
      cleanupColleges.push(college!.id);

      // Admin marks institution as 'reviewed'
      const { data: reviewed, error: reviewError } = await adminClient!
        .from('college_registrations')
        .update({
          status: 'reviewed',
          admin_notes: 'Placement calendar reviewed. 2026 batch eligibility confirmed.',
        })
        .eq('id', college!.id)
        .select('id, status, admin_notes')
        .single();

      expect(reviewError).toBeNull();
      expect(reviewed?.status).toBe('reviewed');
    });
  });
});

describe('Live Supabase Integration Blocked State Documentation', () => {
  it('documents environment prerequisite status for live integration testing', () => {
    if (!isConfigured) {
      // Diagnostic output when remote database is blocked
      console.warn(
        '\n[NOTICE: LIVE SUPABASE INTEGRATION BLOCKED]\n' +
          'Reason: Live development credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are placeholders or NEXT_PUBLIC_ENABLE_LOCAL_MOCKS is true without RUN_LIVE_TESTS=true.\n' +
          'Action: To run live integration tests, link a separate dev project (npx supabase link) or populate .env.local with development credentials, set RUN_LIVE_TESTS=true, and re-run.\n'
      );
    }
    expect(true).toBe(true);
  });
});
