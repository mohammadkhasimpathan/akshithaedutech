import { SupabaseClient } from '@supabase/supabase-js';
import { connection } from 'next/server';
import { Job, WorkMode, EmploymentType } from '@/types/database';
import { MOCK_JOBS } from './mock-data';

export interface GetPublishedJobsOptions {
  experienceType?: 'all' | 'fresher' | 'experienced';
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  category?: string;
  location?: string;
  sortBy?: 'newest' | 'featured' | 'salary_high';
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface JobEligibilityResult {
  eligible: boolean;
  reason?: string;
  job?: Job;
}

/**
 * Filter mock jobs for local development and test environments
 */
function filterMockJobs(options: GetPublishedJobsOptions): { jobs: Job[]; count: number } {
  const {
    experienceType = 'all',
    workMode,
    employmentType,
    category,
    location,
    sortBy = 'featured',
    searchQuery,
    limit = 20,
    offset = 0,
  } = options;

  const now = Date.now();

  const filtered = MOCK_JOBS.filter((job) => {
    // Only published
    if (job.status !== 'published') return false;

    // Not expired
    if (job.application_deadline && new Date(job.application_deadline).getTime() < now) {
      return false;
    }

    // Work Mode
    if (workMode && job.work_mode !== workMode) return false;

    // Employment Type
    if (employmentType && job.employment_type !== employmentType) return false;

    // Category
    if (category && job.category.toLowerCase() !== category.toLowerCase()) return false;

    // Location
    if (location && !job.location.toLowerCase().includes(location.toLowerCase().trim())) {
      return false;
    }

    // Experience Type
    if (experienceType === 'fresher') {
      if (job.experience_min !== 0 || job.experience_max > 1) return false;
    } else if (experienceType === 'experienced') {
      if (job.experience_min === 0 && job.experience_max <= 1) return false;
    }

    // Search Query (matches title, description, skills)
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = job.title.toLowerCase().includes(q);
      const descMatch = job.description.toLowerCase().includes(q);
      const skillsMatch = job.skills.some((s) => s.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !skillsMatch) return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'newest') {
      const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bTime - aTime;
    }
    if (sortBy === 'salary_high') {
      const aSal = a.salary_max || a.salary_min || 0;
      const bSal = b.salary_max || b.salary_min || 0;
      return bSal - aSal;
    }
    // Default: 'featured' first, then published_at descending
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    return bTime - aTime;
  });

  const paged = filtered.slice(offset, offset + limit);

  return {
    jobs: paged,
    count: filtered.length,
  };
}

async function resolveSupabaseClient(providedClient?: SupabaseClient | null): Promise<SupabaseClient | null> {
  if (providedClient) return providedClient;
  try {
    const { createClient } = await import('@/lib/supabase/server');
    return await createClient();
  } catch {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      return createClient();
    } catch {
      return null;
    }
  }
}

/**
 * Server-side helper to query published, non-expired jobs with typed filters.
 * Returns mock dataset only when NEXT_PUBLIC_ENABLE_LOCAL_MOCKS is enabled.
 */
export async function getPublishedJobs(
  supabase?: SupabaseClient | null,
  options: GetPublishedJobsOptions = {}
): Promise<{ jobs: Job[]; count: number }> {
  try {
    await connection();
  } catch {
    // Graceful fallback for test runners or environments without request context
  }

  const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMockEnabled && !supabase) {
    return filterMockJobs(options);
  }

  const client = await resolveSupabaseClient(supabase);
  if (!client) {
    if (isMockEnabled) {
      return filterMockJobs(options);
    }
    return { jobs: [], count: 0 };
  }

  try {
    const {
      experienceType = 'all',
      workMode,
      employmentType,
      category,
      location,
      sortBy = 'featured',
      searchQuery,
      limit = 20,
      offset = 0,
    } = options;

    let query = client
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString()}`);

    if (sortBy === 'newest') {
      query = query.order('published_at', { ascending: false });
    } else if (sortBy === 'salary_high') {
      query = query.order('salary_max', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('featured', { ascending: false }).order('published_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    if (workMode) {
      query = query.eq('work_mode', workMode);
    }

    if (employmentType) {
      query = query.eq('employment_type', employmentType);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (location && location.trim().length > 0) {
      const sanitizedLoc = location.trim().replace(/[%_]/g, '');
      query = query.ilike('location', `%${sanitizedLoc}%`);
    }

    if (experienceType === 'fresher') {
      query = query.eq('experience_min', 0).lte('experience_max', 1);
    } else if (experienceType === 'experienced') {
      query = query.or('experience_min.gte.1,experience_max.gte.2');
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const sanitized = searchQuery.trim().replace(/[%_]/g, '');
      query = query.ilike('title', `%${sanitized}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      if (isMockEnabled) {
        return filterMockJobs(options);
      }
      return { jobs: [], count: 0 };
    }

    return {
      jobs: (data as Job[]) || [],
      count: count || 0,
    };
  } catch {
    if (isMockEnabled) {
      return filterMockJobs(options);
    }
    return { jobs: [], count: 0 };
  }
}

/**
 * Retrieves a single published job by URL slug.
 */
export async function getPublishedJobBySlug(
  supabase?: SupabaseClient | null,
  slug?: string
): Promise<Job | null> {
  if (!slug) return null;

  try {
    await connection();
  } catch {
    // Graceful fallback for tests
  }

  const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMockEnabled && !supabase) {
    const job = MOCK_JOBS.find(
      (j) =>
        j.slug === slug &&
        j.status === 'published' &&
        (!j.application_deadline || new Date(j.application_deadline).getTime() >= Date.now())
    );
    return job || null;
  }

  const client = await resolveSupabaseClient(supabase);
  if (!client) {
    if (isMockEnabled) {
      const fallback = MOCK_JOBS.find((j) => j.slug === slug && j.status === 'published');
      return fallback || null;
    }
    return null;
  }

  try {
    const { data, error } = await client
      .from('jobs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString()}`)
      .maybeSingle();

    if (error || !data) {
      if (isMockEnabled) {
        const fallback = MOCK_JOBS.find((j) => j.slug === slug && j.status === 'published');
        return fallback || null;
      }
      return null;
    }

    return (data as Job) || null;
  } catch {
    if (isMockEnabled) {
      const fallback = MOCK_JOBS.find((j) => j.slug === slug && j.status === 'published');
      return fallback || null;
    }
    return null;
  }
}

/**
 * Checks whether a job exists, is currently published, and has not passed its application deadline.
 * Used prior to accepting candidate submissions.
 */
export async function verifyJobEligibilityForApplication(
  supabase?: SupabaseClient | null,
  jobId?: string
): Promise<JobEligibilityResult> {
  if (!jobId) {
    return {
      eligible: false,
      reason: 'Job identifier is required.',
    };
  }

  const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMockEnabled && !supabase) {
    const job = MOCK_JOBS.find((j) => j.id === jobId);
    if (!job) {
      return { eligible: false, reason: 'The specified job posting does not exist.' };
    }
    if (job.status !== 'published') {
      return { eligible: false, reason: `This position is currently not open for new applications (status: ${job.status}).`, job };
    }
    if (job.application_deadline && new Date(job.application_deadline).getTime() < Date.now()) {
      return { eligible: false, reason: 'The deadline for submitting applications for this position has passed.', job };
    }
    return { eligible: true, job };
  }

  const client = await resolveSupabaseClient(supabase);
  if (!client) {
    if (isMockEnabled) {
      const job = MOCK_JOBS.find((j) => j.id === jobId);
      if (job) return { eligible: job.status === 'published', job };
    }
    return {
      eligible: false,
      reason: 'Database service is currently unavailable.',
    };
  }

  try {
    const { data, error } = await client
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (error || !data) {
      if (isMockEnabled) {
        const mockJob = MOCK_JOBS.find((j) => j.id === jobId);
        if (mockJob) {
          if (mockJob.status !== 'published') {
            return { eligible: false, reason: `This position is currently not open for new applications (status: ${mockJob.status}).`, job: mockJob };
          }
          return { eligible: true, job: mockJob };
        }
      }

      return {
        eligible: false,
        reason: 'The specified job posting does not exist.',
      };
    }

    const job = data as Job;

    if (job.status !== 'published') {
      return {
        eligible: false,
        reason: `This position is currently not open for new applications (status: ${job.status}).`,
        job,
      };
    }

    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      if (deadline.getTime() < Date.now()) {
        return {
          eligible: false,
          reason: 'The deadline for submitting applications for this position has passed.',
          job,
        };
      }
    }

    return {
      eligible: true,
      job,
    };
  } catch {
    if (isMockEnabled) {
      const mockJob = MOCK_JOBS.find((j) => j.id === jobId);
      if (mockJob && mockJob.status === 'published') {
        return { eligible: true, job: mockJob };
      }
    }
    return { eligible: false, reason: 'Failed to verify job eligibility.' };
  }
}
