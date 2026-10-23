import { z } from 'zod';

// ============================================================================
// Akshitha Edutech Private Limited — Registration Validation Schemas
// ============================================================================

const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;

/**
 * Feature A: Student / Fresher Registration Schema
 * For candidates seeking career guidance, jobs, internships, skill training, and placement support.
 */
export const studentRegistrationSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(150, 'Email must not exceed 150 characters'),

    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a valid phone number (10 to 15 digits)'),

    city: z
      .string()
      .trim()
      .min(2, 'City is required')
      .max(100, 'City must not exceed 100 characters'),

    state: z
      .string()
      .trim()
      .min(2, 'State is required')
      .max(100, 'State must not exceed 100 characters'),

    college_name: z
      .string()
      .trim()
      .min(2, 'College/Institution name is required')
      .max(150, 'College name must not exceed 150 characters'),

    course: z
      .string()
      .trim()
      .min(2, 'Degree/Course is required (e.g. B.Tech, MCA, B.Sc)')
      .max(100, 'Course must not exceed 100 characters'),

    specialization: z
      .string()
      .trim()
      .min(2, 'Specialization is required (e.g. Computer Science, Finance, Mechanical)')
      .max(100, 'Specialization must not exceed 100 characters'),

    graduation_year: z
      .coerce
      .number()
      .int()
      .min(2000, 'Graduation year must be 2000 or later')
      .max(2040, 'Graduation year must be 2040 or earlier'),

    skills: z
      .union([
        z.array(z.string().trim().min(1)).min(1, 'Please select or list at least one skill'),
        z.string().trim().min(1, 'Please enter your skills (e.g. JavaScript, Python, Communication)'),
      ])
      .transform((val) => {
        if (Array.isArray(val)) return val;
        return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }),

    experience_status: z.enum(['fresher', 'experienced'], {
      message: 'Please indicate whether you are a fresher or experienced',
    }),

    experience_years: z
      .coerce
      .number()
      .min(0, 'Experience cannot be negative')
      .max(50, 'Experience must be 50 or fewer years')
      .default(0),

    opportunity_interests: z
      .union([
        z.array(z.string().trim()).min(1, 'Select at least one opportunity interest'),
        z.string().trim().min(1, 'Select at least one opportunity interest'),
      ])
      .transform((val) => {
        if (Array.isArray(val)) return val;
        return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }),

    preferred_locations: z
      .union([
        z.array(z.string().trim()),
        z.string().trim(),
      ])
      .default([])
      .transform((val) => {
        if (Array.isArray(val)) return val;
        if (!val) return [];
        return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }),

    consent: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must acknowledge and consent to the privacy policy',
      }),

    website_hp: z
      .string()
      .max(0, 'Spam detected')
      .optional()
      .nullable(),
  })
  .strict();

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;

/**
 * Feature B: Employer Registration Schema
 * For companies/recruiters seeking hiring partnerships, campus drives, and verified talent.
 */
export const employerRegistrationSchema = z
  .object({
    company_name: z
      .string()
      .trim()
      .min(2, 'Company name must be at least 2 characters')
      .max(150, 'Company name must not exceed 150 characters'),

    contact_person: z
      .string()
      .trim()
      .min(2, 'Official contact person name is required')
      .max(100, 'Contact person name must not exceed 100 characters'),

    business_email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid official business email')
      .max(150, 'Email must not exceed 150 characters'),

    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a valid phone number (10 to 15 digits)'),

    designation: z
      .string()
      .trim()
      .min(2, 'Designation / Role in company is required')
      .max(100, 'Designation must not exceed 100 characters'),

    website: z
      .string()
      .trim()
      .url('Please enter a valid company website URL (e.g. https://company.com)')
      .optional()
      .or(z.literal(''))
      .transform((val) => (val && val.length > 0 ? val : null)),

    industry: z
      .string()
      .trim()
      .min(2, 'Industry is required (e.g. IT & Software, Manufacturing, Healthcare)')
      .max(100, 'Industry must not exceed 100 characters'),

    office_location: z
      .string()
      .trim()
      .min(2, 'Office location / City is required')
      .max(150, 'Office location must not exceed 150 characters'),

    hiring_needs: z
      .string()
      .trim()
      .min(10, 'Please describe your hiring requirements in at least 10 characters')
      .max(3000, 'Hiring needs description must not exceed 3000 characters'),

    opportunity_types: z
      .union([
        z.array(z.string().trim()).min(1, 'Select at least one opportunity type'),
        z.string().trim().min(1, 'Select at least one opportunity type'),
      ])
      .transform((val) => {
        if (Array.isArray(val)) return val;
        return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }),

    hiring_volume: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    collaboration_interests: z
      .union([
        z.array(z.string().trim()),
        z.string().trim(),
      ])
      .default([])
      .transform((val) => {
        if (Array.isArray(val)) return val;
        if (!val) return [];
        return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }),

    consent: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must acknowledge and consent to the privacy policy',
      }),

    website_hp: z
      .string()
      .max(0, 'Spam detected')
      .optional()
      .nullable(),
  })
  .strict();

export type EmployerRegistrationInput = z.infer<typeof employerRegistrationSchema>;

/**
 * Feature C: College / Institution Registration Schema
 * For educational institutions seeking placement drives, faculty training, and student empowerment.
 */
export const collegeRegistrationSchema = z
  .object({
    institution_name: z
      .string()
      .trim()
      .min(2, 'Institution name must be at least 2 characters')
      .max(150, 'Institution name must not exceed 150 characters'),

    institution_type: z
      .string()
      .trim()
      .min(2, 'Institution type is required (e.g. Engineering College, University, Polytechnic)')
      .max(100, 'Institution type must not exceed 100 characters'),

    official_email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid official institution email')
      .max(150, 'Email must not exceed 150 characters'),

    contact_person: z
      .string()
      .trim()
      .min(2, 'Contact person name is required (e.g. TPO / Placement Head / Principal)')
      .max(100, 'Contact person name must not exceed 100 characters'),

    designation: z
      .string()
      .trim()
      .min(2, 'Designation is required (e.g. Placement Officer, Principal, Dean)')
      .max(100, 'Designation must not exceed 100 characters'),

    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Please enter a valid phone number (10 to 15 digits)'),

    city: z
      .string()
      .trim()
      .min(2, 'City is required')
      .max(100, 'City must not exceed 100 characters'),

    state: z
      .string()
      .trim()
      .min(2, 'State is required')
      .max(100, 'State must not exceed 100 characters'),

    website: z
      .string()
      .trim()
      .url('Please enter a valid institution website URL')
      .optional()
      .or(z.literal(''))
      .transform((val) => (val && val.length > 0 ? val : null)),

    courses_departments: z
      .union([
        z.array(z.string().trim()),
        z.string().trim(),
      ])
      .default([])
      .transform((val) => {
        if (Array.isArray(val)) return val;
        if (!val) return [];
        return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }),

    student_strength: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    placement_cell_details: z
      .string()
      .trim()
      .min(10, 'Please provide placement cell details or current placement objectives in at least 10 characters')
      .max(3000, 'Placement cell details must not exceed 3000 characters'),

    collaboration_interests: z
      .union([
        z.array(z.string().trim()),
        z.string().trim(),
      ])
      .default([])
      .transform((val) => {
        if (Array.isArray(val)) return val;
        if (!val) return [];
        return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      }),

    consent: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must acknowledge and consent to the privacy policy',
      }),

    website_hp: z
      .string()
      .max(0, 'Spam detected')
      .optional()
      .nullable(),
  })
  .strict();

export type CollegeRegistrationInput = z.infer<typeof collegeRegistrationSchema>;

/**
 * Admin Review Schema
 */
export const reviewRegistrationSchema = z.object({
  id: z.string().uuid('Invalid registration ID'),
  status: z.enum(['pending', 'reviewed', 'approved', 'rejected']),
  admin_notes: z.string().trim().max(2000).optional().nullable(),
});

export type ReviewRegistrationInput = z.infer<typeof reviewRegistrationSchema>;
