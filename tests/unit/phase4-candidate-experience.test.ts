import { describe, it, expect, beforeEach } from 'vitest';
import { getPublishedJobs, getPublishedJobBySlug, verifyJobEligibilityForApplication } from '@/lib/data/jobs';
import { submitCandidateApplication, clearMockSubmittedApplications } from '@/app/actions/application-actions';
import { submitCareerEnquiry } from '@/app/actions/enquiry-actions';
import { submitJobReport } from '@/app/actions/report-actions';
import { memoryStore } from '@/lib/security/rate-limiter';
import { PDF_MAGIC_BYTES } from '@/lib/security/resume-validator';

// Helper to create a realistic PDF File object for FormData
function createMockPdfFile(name: string, sizeBytes: number = 1024, validMagic: boolean = true): File {
  const buffer = Buffer.alloc(sizeBytes);
  if (validMagic) {
    PDF_MAGIC_BYTES.copy(buffer, 0);
    buffer.write('1.7 mock content', 5);
  } else {
    buffer.write('<html><body>Not a PDF</body></html>', 0);
  }
  return new File([buffer], name, { type: 'application/pdf' });
}

describe('Phase 4: Public Job Portal & Candidate Experience (Mocked & Unit Tests)', () => {
  const publishedFresherJobId = 'a0000000-0000-4000-a000-000000000001';
  const publishedExperiencedJobId = 'a0000000-0000-4000-a000-000000000002';
  const draftJobSlug = 'lead-ui-ux-designer-draft';
  const closedJobSlug = 'operations-associate-closed';

  beforeEach(() => {
    clearMockSubmittedApplications();
    memoryStore.clear();
  });

  describe('1. Job Search, Filtering, and Sorting Helpers', () => {
    it('should retrieve only published, non-expired jobs (never returning draft or closed jobs)', async () => {
      const { jobs } = await getPublishedJobs(null);

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((job) => {
        expect(job.status).toBe('published');
        if (job.application_deadline) {
          expect(new Date(job.application_deadline).getTime()).toBeGreaterThanOrEqual(Date.now());
        }
      });

      const hasDraft = jobs.some((j) => j.slug === draftJobSlug);
      const hasClosed = jobs.some((j) => j.slug === closedJobSlug);
      expect(hasDraft).toBe(false);
      expect(hasClosed).toBe(false);
    });

    it('should filter jobs strictly for freshers (0 to 1 years experience)', async () => {
      const { jobs } = await getPublishedJobs(null, { experienceType: 'fresher' });

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((job) => {
        expect(job.experience_min).toBe(0);
        expect(job.experience_max).toBeLessThanOrEqual(1);
      });
    });

    it('should filter jobs strictly for experienced professionals (2+ years experience)', async () => {
      const { jobs } = await getPublishedJobs(null, { experienceType: 'experienced' });

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((job) => {
        expect(job.experience_max).toBeGreaterThanOrEqual(2);
      });
    });

    it('should filter jobs by work mode (e.g. remote only)', async () => {
      const { jobs } = await getPublishedJobs(null, { workMode: 'remote' });

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((job) => {
        expect(job.work_mode).toBe('remote');
      });
    });

    it('should filter jobs by location (case-insensitive substring match)', async () => {
      const { jobs } = await getPublishedJobs(null, { location: 'bengaluru' });

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((job) => {
        expect(job.location.toLowerCase()).toContain('bengaluru');
      });
    });

    it('should filter jobs by category (e.g. Engineering)', async () => {
      const { jobs } = await getPublishedJobs(null, { category: 'Engineering' });

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((job) => {
        expect(job.category).toBe('Engineering');
      });
    });

    it('should search jobs by keyword across title, description, and skills', async () => {
      const { jobs } = await getPublishedJobs(null, { searchQuery: 'React' });

      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((job) => {
        const textToSearch = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
        expect(textToSearch).toContain('react');
      });
    });

    it('should sort jobs by newest first (published_at descending)', async () => {
      const { jobs } = await getPublishedJobs(null, { sortBy: 'newest' });

      expect(jobs.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < jobs.length - 1; i++) {
        const timeA = new Date(jobs[i].published_at || 0).getTime();
        const timeB = new Date(jobs[i + 1].published_at || 0).getTime();
        expect(timeA).toBeGreaterThanOrEqual(timeB);
      }
    });

    it('should sort jobs by salary high-to-low', async () => {
      const { jobs } = await getPublishedJobs(null, { sortBy: 'salary_high' });

      expect(jobs.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < jobs.length - 1; i++) {
        const salA = jobs[i].salary_max || jobs[i].salary_min || 0;
        const salB = jobs[i + 1].salary_max || jobs[i + 1].salary_min || 0;
        expect(salA).toBeGreaterThanOrEqual(salB);
      }
    });

    it('should paginate results with limit and offset', async () => {
      const { jobs: page1, count } = await getPublishedJobs(null, { limit: 2, offset: 0 });
      const { jobs: page2 } = await getPublishedJobs(null, { limit: 2, offset: 2 });

      expect(count).toBeGreaterThanOrEqual(3);
      expect(page1.length).toBe(2);
      expect(page2.length).toBeGreaterThanOrEqual(1);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('2. Job Details & Eligibility Security', () => {
    it('should retrieve a published job by slug', async () => {
      const job = await getPublishedJobBySlug(null, 'graduate-trainee-software-engineer');
      expect(job).toBeDefined();
      expect(job?.title).toBe('Graduate Trainee - Software Engineer');
      expect(job?.status).toBe('published');
    });

    it('CRITICAL SECURITY: should return null for draft job postings to prevent disclosure', async () => {
      const job = await getPublishedJobBySlug(null, draftJobSlug);
      expect(job).toBeNull();
    });

    it('CRITICAL SECURITY: should return null for closed job postings in active view', async () => {
      const job = await getPublishedJobBySlug(null, closedJobSlug);
      expect(job).toBeNull();
    });

    it('should verify eligibility for active published positions', async () => {
      const result = await verifyJobEligibilityForApplication(null, publishedFresherJobId);
      expect(result.eligible).toBe(true);
      expect(result.job).toBeDefined();
    });

    it('should deny application eligibility for draft jobs', async () => {
      const draftJobId = 'a0000000-0000-4000-a000-000000000005';
      const result = await verifyJobEligibilityForApplication(null, draftJobId);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not open for new applications');
    });
  });

  describe('3. Direct Candidate Application Server Action', () => {
    function buildValidFormData(overrides: Record<string, string | File> = {}): FormData {
      const formData = new FormData();
      formData.set('candidate_name', 'Vikram Patel');
      formData.set('email', 'vikram.patel@example.com');
      formData.set('phone', '+91 98765 43210');
      formData.set('city', 'Bengaluru');
      formData.set('education', 'B.Tech in Information Technology');
      formData.set('experience_years', '0');
      formData.set('cover_letter', 'Enthusiastic fresher eager to contribute to educational tech platforms.');
      formData.set('job_id', publishedFresherJobId);
      formData.set('consent', 'true');
      formData.set('website_hp', '');
      formData.set('resume', createMockPdfFile('Vikram_Resume.pdf', 2048, true));

      Object.entries(overrides).forEach(([k, v]) => {
        formData.set(k, v);
      });

      return formData;
    }

    it('should successfully accept a valid fresher application with 0 years experience', async () => {
      const formData = buildValidFormData({ experience_years: '0' });
      const response = await submitCandidateApplication(formData);

      expect(response.success).toBe(true);
      expect(response.referenceId).toBeDefined();
      expect(response.candidateName).toBe('Vikram Patel');
    });

    it('should successfully accept a valid experienced application', async () => {
      const formData = buildValidFormData({
        email: 'experienced.dev@example.com',
        experience_years: '4',
        job_id: publishedExperiencedJobId,
      });
      const response = await submitCandidateApplication(formData);

      expect(response.success).toBe(true);
      expect(response.referenceId).toBeDefined();
    });

    it('should reject application when candidate consent checkbox is missing', async () => {
      const formData = buildValidFormData({ consent: 'false' });
      const response = await submitCandidateApplication(formData);

      expect(response.success).toBe(false);
      expect(response.fieldErrors?.consent).toBeDefined();
    });

    it('should reject fake / malformed PDF files (missing %PDF- magic bytes)', async () => {
      const fakePdf = createMockPdfFile('fake_resume.pdf', 1024, false);
      const formData = buildValidFormData({ resume: fakePdf });
      const response = await submitCandidateApplication(formData);

      expect(response.success).toBe(false);
      expect(response.error).toContain('Only genuine PDF documents (%PDF-) are accepted');
    });

    it('should reject oversized PDF resumes (> 5 MB)', async () => {
      const oversizedPdf = createMockPdfFile('huge.pdf', 6 * 1024 * 1024, true);
      const formData = buildValidFormData({ resume: oversizedPdf });
      const response = await submitCandidateApplication(formData);

      expect(response.success).toBe(false);
      expect(response.error).toContain('exceeds the maximum allowed limit of 5 MB');
    });

    it('CRITICAL: should detect and prevent duplicate application submissions for same candidate and job', async () => {
      const formData1 = buildValidFormData({ email: 'duplicate.applicant@example.com' });
      const response1 = await submitCandidateApplication(formData1);
      expect(response1.success).toBe(true);

      // Attempt duplicate submission with the same email for the same job
      const formData2 = buildValidFormData({ email: 'duplicate.applicant@example.com' });
      const response2 = await submitCandidateApplication(formData2);

      expect(response2.success).toBe(false);
      expect(response2.error).toContain('already been submitted for this position');
    });

    it('should silently deter spam bots when honeypot field is filled', async () => {
      const botFormData = buildValidFormData({
        email: 'bot@spam.com',
        website_hp: 'https://malicious-spam-bot.com',
      });
      const response = await submitCandidateApplication(botFormData);

      // Returns silent success without persisting data
      expect(response.success).toBe(true);
      expect(response.candidateName).toBe('Applicant');
    });
  });

  describe('4. Career Enquiry Server Action', () => {
    function buildEnquiryFormData(overrides: Record<string, string> = {}): FormData {
      const formData = new FormData();
      formData.set('name', 'Ananya Deshmukh');
      formData.set('email', 'ananya@example.com');
      formData.set('phone', '+91 98765 11111');
      formData.set('enquiry_type', 'career_guidance');
      formData.set('message', 'I am graduating in 2026 and would like advice on private sector recruitment.');
      formData.set('website_hp', '');

      Object.entries(overrides).forEach(([k, v]) => {
        formData.set(k, v);
      });

      return formData;
    }

    it('should accept valid career enquiry submissions', async () => {
      const formData = buildEnquiryFormData();
      const response = await submitCareerEnquiry(formData);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Thank you for reaching out');
    });

    it('should reject messages shorter than 10 characters', async () => {
      const formData = buildEnquiryFormData({ message: 'Hi team' });
      const response = await submitCareerEnquiry(formData);

      expect(response.success).toBe(false);
      expect(response.fieldErrors?.message).toBeDefined();
    });

    it('should reject invalid email formatting', async () => {
      const formData = buildEnquiryFormData({ email: 'invalid-email-format' });
      const response = await submitCareerEnquiry(formData);

      expect(response.success).toBe(false);
      expect(response.fieldErrors?.email).toBeDefined();
    });

    it('should silently handle spam bot submissions via honeypot', async () => {
      const botFormData = buildEnquiryFormData({ website_hp: 'https://spam-bot.net' });
      const response = await submitCareerEnquiry(botFormData);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Thank you for contacting us');
    });
  });

  describe('5. Job Flagging & Report Server Action', () => {
    it('should accept valid report submissions for an active job', async () => {
      const payload = {
        job_id: publishedFresherJobId,
        reporter_name: 'Concerned Applicant',
        reporter_email: 'reporter@example.com',
        reason: 'incorrect_info' as const,
        details: 'The work mode in the title says remote but description specifies on-site.',
        website_hp: '',
      };

      const response = await submitJobReport(payload);
      expect(response.success).toBe(true);
      expect(response.message).toContain('Thank you for reporting this position');
    });

    it('should reject report when report details are too short', async () => {
      const payload = {
        job_id: publishedFresherJobId,
        reporter_email: 'reporter@example.com',
        reason: 'offensive_content' as const,
        details: 'bad', // shorter than 5 chars
        website_hp: '',
      };

      const response = await submitJobReport(payload);
      expect(response.success).toBe(false);
      expect(response.fieldErrors?.details).toBeDefined();
    });

    it('should reject report with invalid report reason', async () => {
      const payload = {
        job_id: publishedFresherJobId,
        reporter_email: 'reporter@example.com',
        reason: 'not_a_real_reason',
        details: 'Reason code is invalid.',
        website_hp: '',
      };

      const response = await submitJobReport(payload);
      expect(response.success).toBe(false);
    });
  });
});
