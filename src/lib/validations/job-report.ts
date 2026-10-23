import { z } from 'zod';

export const publicJobReportSchema = z
  .object({
    job_id: z
      .string()
      .uuid('Invalid job identifier'),

    reporter_name: z
      .string()
      .trim()
      .max(100, 'Name must not exceed 100 characters')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    reporter_email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(150, 'Email must not exceed 150 characters'),

    reason: z.enum(
      ['incorrect_info', 'expired_position', 'offensive_content', 'suspected_scam', 'other'] as const
    ),

    details: z
      .string()
      .trim()
      .min(5, 'Report details must be at least 5 characters')
      .max(2000, 'Report details must not exceed 2000 characters'),

    // Honeypot field for bot deterrence
    website_hp: z
      .string()
      .max(0, 'Automated submission detected')
      .optional()
      .nullable(),
  })
  .strict();

export type PublicJobReportInput = z.infer<typeof publicJobReportSchema>;
