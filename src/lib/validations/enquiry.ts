import { z } from 'zod';

export const publicEnquirySchema = z
  .object({
    name: z
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
      .regex(/^[+]?[0-9\s-]{7,20}$/, 'Please enter a valid phone number')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    enquiry_type: z.enum(
      ['general', 'career_guidance', 'job_specific', 'partnership', 'other'] as const
    ),

    related_job_id: z
      .string()
      .uuid('Invalid related job identifier')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    message: z
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(3000, 'Message must not exceed 3000 characters'),

    // Honeypot field for bot deterrence
    website_hp: z
      .string()
      .max(0, 'Automated submission detected')
      .optional()
      .nullable(),
  })
  .strict();

export type PublicEnquiryInput = z.infer<typeof publicEnquirySchema>;
