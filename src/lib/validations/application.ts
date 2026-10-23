import { z } from 'zod';

// Public Candidate Direct Application Schema
// Strictly rejects privileged internal fields (internal_notes, status, resume_path, etc.)
export const publicApplicationSchema = z
  .object({
    candidate_name: z
      .string()
      .trim()
      .min(2, 'Candidate full name must be at least 2 characters')
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
      .regex(/^[+]?[0-9\s-]{7,20}$/, 'Please enter a valid phone number (7 to 20 digits)'),

    city: z
      .string()
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must not exceed 100 characters'),

    education: z
      .string()
      .trim()
      .min(2, 'Education qualification must be at least 2 characters')
      .max(150, 'Education must not exceed 150 characters'),

    experience_years: z
      .coerce
      .number()
      .min(0, 'Experience years cannot be negative (enter 0 for freshers)')
      .max(50, 'Experience years must be 50 or fewer'),

    cover_letter: z
      .string()
      .trim()
      .max(2500, 'Cover letter must not exceed 2500 characters')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    job_id: z
      .string()
      .uuid('Invalid job identifier'),

    consent: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must acknowledge and consent to submitting your application details',
      }),

    // Honeypot field for bot deterrence: Must remain empty
    website_hp: z
      .string()
      .max(0, 'Automated submission detected')
      .optional()
      .nullable(),
  })
  .strict();

export type PublicApplicationInput = z.infer<typeof publicApplicationSchema>;
