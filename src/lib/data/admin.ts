import 'server-only';
import {
  Application,
  ApplicationStatus,
  Enquiry,
  EnquiryStatus,
  Job,
  JobReport,
  JobReportStatus,
  JobStatus,
} from '@/types/database';
import {
  getMockJobs,
  getMockApplications,
  getMockEnquiries,
  getMockReports,
} from './mock-data';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AdminDashboardMetrics {
  jobs: {
    total: number;
    published: number;
    draft: number;
    closed: number;
    archived: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
  };
  enquiries: {
    total: number;
    unresolved: number;
    new: number;
    in_progress: number;
    resolved: number;
  };
  reports: {
    total: number;
    pending: number;
    reviewed: number;
    dismissed: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'application' | 'enquiry' | 'report' | 'job';
    title: string;
    subtitle: string;
    timestamp: string;
    status: string;
  }>;
}

export interface GetAdminJobsOptions {
  search?: string;
  status?: JobStatus | 'all';
  page?: number;
  limit?: number;
}

export interface GetAdminApplicationsOptions {
  search?: string;
  jobId?: string;
  status?: ApplicationStatus | 'all';
  page?: number;
  limit?: number;
}

export interface ApplicationWithJob extends Application {
  job_title?: string;
  job_slug?: string;
}

export interface ReportWithJob extends JobReport {
  job_title?: string;
  job_slug?: string;
}

/**
 * Calculates aggregated operational metrics for the administrative dashboard.
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    const jobs = getMockJobs();
    const applications = getMockApplications();
    const enquiries = getMockEnquiries();
    const reports = getMockReports();

    const jobsCount = {
      total: jobs.length,
      published: jobs.filter((j) => j.status === 'published').length,
      draft: jobs.filter((j) => j.status === 'draft').length,
      closed: jobs.filter((j) => j.status === 'closed').length,
      archived: jobs.filter((j) => j.status === 'archived').length,
    };

    const appsCount = {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      reviewed: applications.filter((a) => a.status === 'reviewed').length,
      shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };

    const enquiriesCount = {
      total: enquiries.length,
      new: enquiries.filter((e) => e.status === 'new').length,
      in_progress: enquiries.filter((e) => e.status === 'in_progress').length,
      resolved: enquiries.filter((e) => e.status === 'resolved').length,
      unresolved: enquiries.filter((e) => e.status === 'new' || e.status === 'in_progress').length,
    };

    const reportsCount = {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      reviewed: reports.filter((r) => r.status === 'reviewed').length,
      dismissed: reports.filter((r) => r.status === 'dismissed').length,
    };

    // Combine recent activities
    const recentActivity: AdminDashboardMetrics['recentActivity'] = [
      ...applications.map((a) => ({
        id: a.id,
        type: 'application' as const,
        title: `${a.candidate_name} submitted application`,
        subtitle: `${a.city} • ${a.education}`,
        timestamp: a.created_at,
        status: a.status,
      })),
      ...enquiries.map((e) => ({
        id: e.id,
        type: 'enquiry' as const,
        title: `Enquiry from ${e.name}`,
        subtitle: e.message.slice(0, 60) + (e.message.length > 60 ? '...' : ''),
        timestamp: e.created_at,
        status: e.status,
      })),
      ...reports.map((r) => ({
        id: r.id,
        type: 'report' as const,
        title: `Job report: ${r.reason.replace('_', ' ')}`,
        subtitle: r.details.slice(0, 60),
        timestamp: r.created_at,
        status: r.status,
      })),
      ...jobs.slice(0, 3).map((j) => ({
        id: j.id,
        type: 'job' as const,
        title: `Job: ${j.title}`,
        subtitle: `${j.location} • ${j.openings} openings`,
        timestamp: j.updated_at,
        status: j.status,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      jobs: jobsCount,
      applications: appsCount,
      enquiries: enquiriesCount,
      reports: reportsCount,
      recentActivity,
    };
  }

  // Live Supabase metrics query via service-role
  const adminClient = createAdminClient();

  const [
    { data: jobs },
    { data: applications },
    { data: enquiries },
    { data: reports },
  ] = await Promise.all([
    adminClient.from('jobs').select('id, title, location, openings, status, updated_at'),
    adminClient.from('applications').select('id, candidate_name, city, education, status, created_at'),
    adminClient.from('enquiries').select('id, name, message, status, created_at'),
    adminClient.from('job_reports').select('id, reason, details, status, created_at'),
  ]);

  const allJobs = (jobs || []) as Job[];
  const allApps = (applications || []) as Application[];
  const allEnquiries = (enquiries || []) as Enquiry[];
  const allReports = (reports || []) as JobReport[];

  return {
    jobs: {
      total: allJobs.length,
      published: allJobs.filter((j) => j.status === 'published').length,
      draft: allJobs.filter((j) => j.status === 'draft').length,
      closed: allJobs.filter((j) => j.status === 'closed').length,
      archived: allJobs.filter((j) => j.status === 'archived').length,
    },
    applications: {
      total: allApps.length,
      pending: allApps.filter((a) => a.status === 'pending').length,
      reviewed: allApps.filter((a) => a.status === 'reviewed').length,
      shortlisted: allApps.filter((a) => a.status === 'shortlisted').length,
      rejected: allApps.filter((a) => a.status === 'rejected').length,
    },
    enquiries: {
      total: allEnquiries.length,
      new: allEnquiries.filter((e) => e.status === 'new').length,
      in_progress: allEnquiries.filter((e) => e.status === 'in_progress').length,
      resolved: allEnquiries.filter((e) => e.status === 'resolved').length,
      unresolved: allEnquiries.filter((e) => e.status === 'new' || e.status === 'in_progress').length,
    },
    reports: {
      total: allReports.length,
      pending: allReports.filter((r) => r.status === 'pending').length,
      reviewed: allReports.filter((r) => r.status === 'reviewed').length,
      dismissed: allReports.filter((r) => r.status === 'dismissed').length,
    },
    recentActivity: [
      ...allApps.map((a) => ({
        id: a.id,
        type: 'application' as const,
        title: `${a.candidate_name} submitted application`,
        subtitle: `${a.city} • ${a.education}`,
        timestamp: a.created_at,
        status: a.status,
      })),
      ...allEnquiries.map((e) => ({
        id: e.id,
        type: 'enquiry' as const,
        title: `Enquiry from ${e.name}`,
        subtitle: e.message.slice(0, 60),
        timestamp: e.created_at,
        status: e.status,
      })),
      ...allReports.map((r) => ({
        id: r.id,
        type: 'report' as const,
        title: `Job report: ${r.reason}`,
        subtitle: r.details.slice(0, 60),
        timestamp: r.created_at,
        status: r.status,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10),
  };
}

/**
 * Retrieves paginated jobs for administrative management.
 */
export async function getAdminJobs(options: GetAdminJobsOptions = {}): Promise<{
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { search, status = 'all', page = 1, limit = 20 } = options;
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    let list = [...getMockJobs()];

    if (status && status !== 'all') {
      list = list.filter((j) => j.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.slug.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q)
      );
    }

    // Sort newest updated first
    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      jobs: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  const adminClient = createAdminClient();
  let query = adminClient.from('jobs').select('*', { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search && search.trim()) {
    query = query.or(
      `title.ilike.%${search}%,slug.ilike.%${search}%,location.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  const offset = (page - 1) * limit;
  query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    return { jobs: [], total: 0, page, limit, totalPages: 1 };
  }

  const total = count || 0;
  return {
    jobs: (data || []) as Job[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Retrieves a single job by id.
 */
export async function getAdminJobById(id: string): Promise<Job | null> {
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    return getMockJobs().find((j) => j.id === id || j.slug === id) || null;
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient.from('jobs').select('*').eq('id', id).maybeSingle();
  return (data as Job) || null;
}

/**
 * Retrieves paginated applications with related job information for review.
 */
export async function getAdminApplications(options: GetAdminApplicationsOptions = {}): Promise<{
  applications: ApplicationWithJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { search, jobId, status = 'all', page = 1, limit = 20 } = options;
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    const jobs = getMockJobs();
    let list = [...getMockApplications()];

    if (jobId) {
      list = list.filter((a) => a.job_id === jobId);
    }

    if (status && status !== 'all') {
      list = list.filter((a) => a.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.candidate_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit).map((app) => {
      const job = jobs.find((j) => j.id === app.job_id);
      return {
        ...app,
        job_title: job?.title || 'Unknown Position',
        job_slug: job?.slug,
      };
    });

    return {
      applications: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  const adminClient = createAdminClient();
  let query = adminClient
    .from('applications')
    .select('*, jobs:job_id(title, slug)', { count: 'exact' });

  if (jobId) {
    query = query.eq('job_id', jobId);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search && search.trim()) {
    query = query.or(
      `candidate_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%`
    );
  }

  const offset = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    return { applications: [], total: 0, page, limit, totalPages: 1 };
  }

  const total = count || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applications = (data || []).map((row: any) => ({
    ...row,
    job_title: row.jobs?.title || 'Unknown Position',
    job_slug: row.jobs?.slug,
  }));

  return {
    applications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Retrieves a single application by id with complete candidate and job details.
 */
export async function getAdminApplicationById(id: string): Promise<ApplicationWithJob | null> {
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    const app = getMockApplications().find((a) => a.id === id);
    if (!app) return null;
    const job = getMockJobs().find((j) => j.id === app.job_id);
    return {
      ...app,
      job_title: job?.title || 'Unknown Position',
      job_slug: job?.slug,
    };
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('applications')
    .select('*, jobs:job_id(title, slug)')
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    job_title: data.jobs?.title || 'Unknown Position',
    job_slug: data.jobs?.slug,
  } as ApplicationWithJob;
}

/**
 * Retrieves paginated candidate and visitor enquiries.
 */
export async function getAdminEnquiries(options: {
  search?: string;
  status?: EnquiryStatus | 'all';
  page?: number;
  limit?: number;
} = {}): Promise<{
  enquiries: Enquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { search, status = 'all', page = 1, limit = 20 } = options;
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    let list = [...getMockEnquiries()];

    if (status && status !== 'all') {
      list = list.filter((e) => e.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.message.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    return {
      enquiries: list.slice(offset, offset + limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  const adminClient = createAdminClient();
  let query = adminClient.from('enquiries').select('*', { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search && search.trim()) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`);
  }

  const offset = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    return { enquiries: [], total: 0, page, limit, totalPages: 1 };
  }

  const total = count || 0;
  return {
    enquiries: (data || []) as Enquiry[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Retrieves paginated job issue reports.
 */
export async function getAdminReports(options: {
  status?: JobReportStatus | 'all';
  page?: number;
  limit?: number;
} = {}): Promise<{
  reports: ReportWithJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { status = 'all', page = 1, limit = 20 } = options;
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    const jobs = getMockJobs();
    let list = [...getMockReports()];

    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    const paginated = list.slice(offset, offset + limit).map((rep) => {
      const job = jobs.find((j) => j.id === rep.job_id);
      return {
        ...rep,
        job_title: job?.title || 'Unknown Position',
        job_slug: job?.slug,
      };
    });

    return {
      reports: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  const adminClient = createAdminClient();
  let query = adminClient
    .from('job_reports')
    .select('*, jobs:job_id(title, slug)', { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const offset = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    return { reports: [], total: 0, page, limit, totalPages: 1 };
  }

  const total = count || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reports = (data || []).map((row: any) => ({
    ...row,
    job_title: row.jobs?.title || 'Unknown Position',
    job_slug: row.jobs?.slug,
  }));

  return {
    reports,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
