import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminJobs } from '@/lib/data/admin';
import { JobStatus } from '@/types/database';
import { JobsClient } from './jobs-client';

export const metadata: Metadata = {
  title: 'Job Postings Management | Admin Portal',
};

interface AdminJobsPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

function JobsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-testid="jobs-skeleton">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-96" />
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-36" />
      </div>

      <div className="flex gap-3">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-40" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4" />
        ))}
      </div>
    </div>
  );
}

async function JobsDataContent({ searchParams }: AdminJobsPageProps) {
  await connection();
  const resolvedParams = await searchParams;

  const search = resolvedParams.search || '';
  const statusParam = (resolvedParams.status as JobStatus | 'all') || 'all';
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 15;

  const { jobs, total } = await getAdminJobs({
    search,
    status: statusParam,
    page,
    limit,
  });

  return (
    <JobsClient
      initialJobs={jobs}
      initialTotal={total}
      initialPage={page}
      initialLimit={limit}
      initialStatus={statusParam}
      initialSearch={search}
    />
  );
}

export default function AdminJobsPage({ searchParams }: AdminJobsPageProps) {
  return (
    <React.Suspense fallback={<JobsSkeleton />}>
      <JobsDataContent searchParams={searchParams} />
    </React.Suspense>
  );
}
