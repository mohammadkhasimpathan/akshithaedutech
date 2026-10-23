'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { adminJobSchema, AdminJobInput } from '@/lib/validations/job';
import { Job, JobStatus } from '@/types/database';
import {
  getMockJobs,
  setMockJobs,
  getMockApplications,
} from '@/lib/data/mock-data';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AdminJobMutationResponse {
  success: boolean;
  job?: Job;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Creates a new job posting with strict schema validation and slug uniqueness checks.
 */
export async function createAdminJob(
  rawInput: unknown
): Promise<AdminJobMutationResponse> {
  try {
    // 1. Enforce active admin authorization
    await requireAdminAuth();

    // 2. Validate input against adminJobSchema
    const parseResult = adminJobSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Please correct the validation errors in the job form.',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const jobData: AdminJobInput = parseResult.data;
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    // 3. Check slug uniqueness
    if (isMock) {
      const existing = getMockJobs().find(
        (j) => j.slug.toLowerCase() === jobData.slug.toLowerCase()
      );
      if (existing) {
        return {
          success: false,
          error: `A job posting with the slug "${jobData.slug}" already exists. Slugs must be unique.`,
          fieldErrors: { slug: ['This URL slug is already taken. Please enter a unique slug.'] },
        };
      }

      const now = new Date().toISOString();
      const newJob: Job = {
        id: crypto.randomUUID(),
        slug: jobData.slug,
        title: jobData.title,
        company_name: jobData.company_name,
        location: jobData.location,
        work_mode: jobData.work_mode,
        employment_type: jobData.employment_type,
        category: jobData.category,
        description: jobData.description,
        responsibilities: jobData.responsibilities,
        qualifications: jobData.qualifications,
        experience_min: jobData.experience_min,
        experience_max: jobData.experience_max,
        salary_min: jobData.salary_min ?? null,
        salary_max: jobData.salary_max ?? null,
        skills: jobData.skills,
        openings: jobData.openings,
        application_deadline: jobData.application_deadline ?? null,
        application_instructions: jobData.application_instructions ?? null,
        status: jobData.status,
        featured: jobData.featured,
        published_at: jobData.status === 'published' ? now : null,
        created_at: now,
        updated_at: now,
      };

      setMockJobs([newJob, ...getMockJobs()]);

      revalidatePath('/admin');
      revalidatePath('/admin/jobs');
      revalidatePath('/jobs');
      revalidatePath(`/jobs/${newJob.slug}`);

      return {
        success: true,
        job: newJob,
      };
    }

    const adminClient = createAdminClient();

    // Verify slug uniqueness in database
    const { data: existingSlug } = await adminClient
      .from('jobs')
      .select('id')
      .eq('slug', jobData.slug)
      .maybeSingle();

    if (existingSlug) {
      return {
        success: false,
        error: `A job posting with the slug "${jobData.slug}" already exists. Slugs must be unique.`,
        fieldErrors: { slug: ['This URL slug is already taken. Please enter a unique slug.'] },
      };
    }

    const now = new Date().toISOString();
    const newJobPayload = {
      ...jobData,
      salary_min: jobData.salary_min ?? null,
      salary_max: jobData.salary_max ?? null,
      application_deadline: jobData.application_deadline ?? null,
      application_instructions: jobData.application_instructions ?? null,
      published_at: jobData.status === 'published' ? now : null,
      created_at: now,
      updated_at: now,
    };

    const { data: inserted, error: insertError } = await adminClient
      .from('jobs')
      .insert(newJobPayload)
      .select('*')
      .single();

    if (insertError || !inserted) {
      return {
        success: false,
        error: `Failed to create job posting: ${insertError?.message || 'Database error'}`,
      };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/jobs');
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${inserted.slug}`);

    return {
      success: true,
      job: inserted as Job,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Job creation failed';
    return {
      success: false,
      error: `Action error: ${message}`,
    };
  }
}

/**
 * Updates an existing job posting with validation and slug collision protection.
 */
export async function updateAdminJob(
  id: string,
  rawInput: unknown
): Promise<AdminJobMutationResponse> {
  try {
    await requireAdminAuth();

    const parseResult = adminJobSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Please correct the validation errors in the job form.',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const jobData: AdminJobInput = parseResult.data;
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const jobs = getMockJobs();
      const existingIndex = jobs.findIndex((j) => j.id === id);
      if (existingIndex === -1) {
        return {
          success: false,
          error: 'Job posting not found.',
        };
      }

      // Check slug uniqueness across other jobs
      const slugCollision = jobs.find(
        (j) => j.id !== id && j.slug.toLowerCase() === jobData.slug.toLowerCase()
      );
      if (slugCollision) {
        return {
          success: false,
          error: `Another job posting is already using the slug "${jobData.slug}".`,
          fieldErrors: { slug: ['This URL slug is already taken. Please enter a unique slug.'] },
        };
      }

      const existingJob = jobs[existingIndex];
      const now = new Date().toISOString();
      const updatedJob: Job = {
        ...existingJob,
        ...jobData,
        salary_min: jobData.salary_min ?? null,
        salary_max: jobData.salary_max ?? null,
        application_deadline: jobData.application_deadline ?? null,
        application_instructions: jobData.application_instructions ?? null,
        published_at:
          jobData.status === 'published'
            ? existingJob.published_at || now
            : existingJob.published_at,
        updated_at: now,
      };

      jobs[existingIndex] = updatedJob;
      setMockJobs([...jobs]);

      revalidatePath('/admin');
      revalidatePath('/admin/jobs');
      revalidatePath('/jobs');
      revalidatePath(`/jobs/${updatedJob.slug}`);

      return {
        success: true,
        job: updatedJob,
      };
    }

    const adminClient = createAdminClient();

    // Verify slug uniqueness excluding current job
    const { data: slugCheck } = await adminClient
      .from('jobs')
      .select('id')
      .eq('slug', jobData.slug)
      .neq('id', id)
      .maybeSingle();

    if (slugCheck) {
      return {
        success: false,
        error: `Another job posting is already using the slug "${jobData.slug}".`,
        fieldErrors: { slug: ['This URL slug is already taken. Please enter a unique slug.'] },
      };
    }

    const now = new Date().toISOString();
    const updatePayload = {
      ...jobData,
      salary_min: jobData.salary_min ?? null,
      salary_max: jobData.salary_max ?? null,
      application_deadline: jobData.application_deadline ?? null,
      application_instructions: jobData.application_instructions ?? null,
      updated_at: now,
    };

    const { data: updated, error } = await adminClient
      .from('jobs')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updated) {
      return {
        success: false,
        error: `Failed to update job: ${error?.message || 'Database error'}`,
      };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/jobs');
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${updated.slug}`);

    return {
      success: true,
      job: updated as Job,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Job update failed';
    return {
      success: false,
      error: `Action error: ${message}`,
    };
  }
}

/**
 * Updates job lifecycle status (e.g. draft -> published -> closed -> archived).
 */
export async function updateAdminJobStatus(
  id: string,
  newStatus: JobStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminAuth();

    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const jobs = getMockJobs();
      const index = jobs.findIndex((j) => j.id === id);
      if (index === -1) {
        return { success: false, error: 'Job not found.' };
      }

      const now = new Date().toISOString();
      jobs[index] = {
        ...jobs[index],
        status: newStatus,
        published_at:
          newStatus === 'published' && !jobs[index].published_at
            ? now
            : jobs[index].published_at,
        updated_at: now,
      };

      setMockJobs([...jobs]);
      revalidatePath('/admin');
      revalidatePath('/admin/jobs');
      revalidatePath('/jobs');
      revalidatePath(`/jobs/${jobs[index].slug}`);

      return { success: true };
    }

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from('jobs')
      .update({
        status: newStatus,
        updated_at: now,
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/jobs');
    revalidatePath('/jobs');

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Status update failed',
    };
  }
}

/**
 * Deletes a job posting ONLY IF no candidate applications exist.
 * Preserves candidate application history according to ON DELETE RESTRICT foreign key integrity.
 */
export async function deleteAdminJob(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminAuth();

    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      // Check for associated applications
      const apps = getMockApplications().filter((a) => a.job_id === id);
      if (apps.length > 0) {
        return {
          success: false,
          error: `Cannot delete this job posting because ${apps.length} candidate application(s) are associated with it. To preserve application history, please close or archive the position instead.`,
        };
      }

      const jobs = getMockJobs().filter((j) => j.id !== id);
      setMockJobs(jobs);

      revalidatePath('/admin');
      revalidatePath('/admin/jobs');
      revalidatePath('/jobs');

      return { success: true };
    }

    const adminClient = createAdminClient();

    // Corroborate application associations
    const { count: appCount } = await adminClient
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', id);

    if (appCount && appCount > 0) {
      return {
        success: false,
        error: `Cannot delete this job posting because ${appCount} candidate application(s) are associated with it. To preserve application history, please close or archive the position instead.`,
      };
    }

    const { error } = await adminClient.from('jobs').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/jobs');
    revalidatePath('/jobs');

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Job deletion failed',
    };
  }
}
