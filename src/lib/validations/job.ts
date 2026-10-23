import { z } from 'zod';

export const adminJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(150, 'Title must not exceed 150 characters'),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must consist of lowercase alphanumeric words separated by hyphens (e.g. software-engineer)'
      )
      .min(3, 'Slug must be at least 3 characters')
      .max(150, 'Slug must not exceed 150 characters'),

    company_name: z
      .string()
      .trim()
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name must not exceed 100 characters')
      .default('Akshitha Edutech Private Limited'),

    location: z
      .string()
      .trim()
      .min(2, 'Location must be at least 2 characters')
      .max(100, 'Location must not exceed 100 characters'),

    work_mode: z.enum(['on-site', 'hybrid', 'remote'] as const),

    employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship'] as const),

    category: z
      .string()
      .trim()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must not exceed 50 characters'),

    description: z
      .string()
      .trim()
      .min(20, 'Job description must be at least 20 characters')
      .max(10000, 'Job description must not exceed 10,000 characters'),

    responsibilities: z
      .array(z.string().trim().min(3, 'Responsibility item must have at least 3 characters'))
      .min(1, 'Please provide at least one key responsibility'),

    qualifications: z
      .array(z.string().trim().min(3, 'Qualification item must have at least 3 characters'))
      .min(1, 'Please provide at least one qualification requirement'),

    skills: z
      .array(z.string().trim().min(1, 'Skill must not be empty'))
      .min(1, 'Please specify at least one skill or technology tag'),

    experience_min: z
      .coerce
      .number()
      .int('Experience must be an integer number of years')
      .min(0, 'Minimum experience cannot be negative')
      .max(40, 'Minimum experience must be 40 or fewer'),

    experience_max: z
      .coerce
      .number()
      .int('Experience must be an integer number of years')
      .min(0, 'Maximum experience cannot be negative')
      .max(50, 'Maximum experience must be 50 or fewer'),

    salary_min: z
      .coerce
      .number()
      .min(0, 'Salary minimum cannot be negative')
      .optional()
      .nullable()
      .transform((val) => (val !== undefined && val !== null && !isNaN(val) ? val : null)),

    salary_max: z
      .coerce
      .number()
      .min(0, 'Salary maximum cannot be negative')
      .optional()
      .nullable()
      .transform((val) => (val !== undefined && val !== null && !isNaN(val) ? val : null)),

    openings: z
      .coerce
      .number()
      .int()
      .min(1, 'Openings must be at least 1')
      .default(1),

    application_deadline: z
      .string()
      .datetime({ message: 'Application deadline must be a valid ISO datetime' })
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    application_instructions: z
      .string()
      .trim()
      .max(1000, 'Application instructions must not exceed 1000 characters')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),

    status: z.enum(['draft', 'published', 'closed', 'archived'] as const),

    featured: z.boolean().default(false),
  })
  .refine((data) => data.experience_max >= data.experience_min, {
    message: 'Maximum experience must be greater than or equal to minimum experience',
    path: ['experience_max'],
  })
  .refine(
    (data) => {
      if (data.salary_min !== null && data.salary_max !== null) {
        return data.salary_max >= data.salary_min;
      }
      return true;
    },
    {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['salary_max'],
    }
  );

export type AdminJobInput = z.infer<typeof adminJobSchema>;
