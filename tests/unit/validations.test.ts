import { describe, it, expect } from 'vitest';
import {
  publicApplicationSchema,
  publicEnquirySchema,
  publicJobReportSchema,
  adminJobSchema,
} from '@/lib/validations';

describe('Phase 3: Validation Schemas & Privilege Rejection', () => {
  const validJobId = 'a0000000-0000-4000-a000-000000000001';

  describe('publicApplicationSchema', () => {
    const validFresherApplication = {
      candidate_name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      education: 'B.Tech in Computer Science',
      experience_years: 0,
      job_id: validJobId,
      consent: true,
      website_hp: '',
    };

    it('should validate a valid fresher application with 0 experience', () => {
      const result = publicApplicationSchema.safeParse(validFresherApplication);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('priya.sharma@example.com');
        expect(result.data.experience_years).toBe(0);
      }
    });

    it('should normalize uppercase email addresses to lowercase', () => {
      const result = publicApplicationSchema.safeParse({
        ...validFresherApplication,
        email: 'PRIYA.SHARMA@EXAMPLE.COM',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('priya.sharma@example.com');
      }
    });

    it('should reject application without mandatory candidate consent', () => {
      const result = publicApplicationSchema.safeParse({
        ...validFresherApplication,
        consent: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('consent');
      }
    });

    it('should reject negative experience years', () => {
      const result = publicApplicationSchema.safeParse({
        ...validFresherApplication,
        experience_years: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone numbers', () => {
      const result = publicApplicationSchema.safeParse({
        ...validFresherApplication,
        phone: 'invalid-phone-abc',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid non-UUID job_id', () => {
      const result = publicApplicationSchema.safeParse({
        ...validFresherApplication,
        job_id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('CRITICAL: should strictly REJECT unexpected privileged fields (internal_notes, status, role)', () => {
      const maliciousPayload = {
        ...validFresherApplication,
        internal_notes: 'Bypassing review process',
        status: 'shortlisted',
        role: 'admin',
      };
      const result = publicApplicationSchema.safeParse(maliciousPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorString = JSON.stringify(result.error.issues);
        expect(errorString).toContain('unrecognized_keys');
      }
    });

    it('should reject submission when bot honeypot field is filled', () => {
      const botPayload = {
        ...validFresherApplication,
        website_hp: 'https://spam-bot.com',
      };
      const result = publicApplicationSchema.safeParse(botPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('publicEnquirySchema', () => {
    const validEnquiry = {
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      phone: '9876543210',
      enquiry_type: 'career_guidance' as const,
      message: 'I would like to enquire about fresher opportunities in backend development.',
    };

    it('should validate valid enquiry data', () => {
      const result = publicEnquirySchema.safeParse(validEnquiry);
      expect(result.success).toBe(true);
    });

    it('should reject messages shorter than 10 characters', () => {
      const result = publicEnquirySchema.safeParse({
        ...validEnquiry,
        message: 'Hi',
      });
      expect(result.success).toBe(false);
    });

    it('should strictly reject privileged internal fields (status, internal_notes)', () => {
      const result = publicEnquirySchema.safeParse({
        ...validEnquiry,
        status: 'resolved',
        internal_notes: 'VIP inquiry',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('publicJobReportSchema', () => {
    const validReport = {
      job_id: validJobId,
      reporter_name: 'Concerned Applicant',
      reporter_email: 'applicant@example.com',
      reason: 'expired_position' as const,
      details: 'This position was filled last week according to the hiring team.',
    };

    it('should validate valid job report data', () => {
      const result = publicJobReportSchema.safeParse(validReport);
      expect(result.success).toBe(true);
    });

    it('should reject invalid report reasons', () => {
      const result = publicJobReportSchema.safeParse({
        ...validReport,
        reason: 'non_existent_reason',
      });
      expect(result.success).toBe(false);
    });

    it('should strictly reject privileged status modifications', () => {
      const result = publicJobReportSchema.safeParse({
        ...validReport,
        status: 'dismissed',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('adminJobSchema', () => {
    const validJob = {
      title: 'Senior Frontend Engineer',
      slug: 'senior-frontend-engineer',
      company_name: 'Akshitha Edutech Private Limited',
      location: 'Bengaluru, Karnataka',
      work_mode: 'hybrid' as const,
      employment_type: 'full-time' as const,
      category: 'Engineering',
      description: 'Lead frontend architecture and design systems for enterprise education platform.',
      responsibilities: ['Architect React components', 'Optimize web performance'],
      qualifications: ['4+ years of React and TypeScript experience'],
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      experience_min: 3,
      experience_max: 7,
      salary_min: 1200000,
      salary_max: 1800000,
      openings: 2,
      status: 'published' as const,
      featured: true,
    };

    it('should validate a complete admin job authoring payload', () => {
      const result = adminJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it('should reject job where experience_max is less than experience_min', () => {
      const result = adminJobSchema.safeParse({
        ...validJob,
        experience_min: 5,
        experience_max: 2,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximum experience');
      }
    });

    it('should reject job where salary_max is less than salary_min', () => {
      const result = adminJobSchema.safeParse({
        ...validJob,
        salary_min: 1500000,
        salary_max: 1000000,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximum salary');
      }
    });

    it('should reject malformed slugs with uppercase letters or special characters', () => {
      const result = adminJobSchema.safeParse({
        ...validJob,
        slug: 'Senior_Job_Slug!',
      });
      expect(result.success).toBe(false);
    });
  });
});
