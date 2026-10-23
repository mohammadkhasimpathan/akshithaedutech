import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminApplications, getAdminJobs } from '@/lib/data/admin';
import { ApplicationStatus } from '@/types/database';
import { ApplicationsClient } from './applications-client';

export const metadata: Metadata = {
  title: 'Candidate Applications | Admin Portal',
};

interface AdminApplicationsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    jobId?: string;
    page?: string;
  }>;
}

function ApplicationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-testid="applications-skeleton">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-96" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-40" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        ))}
      </div>
    </div>
  );
}

async function ApplicationsDataContent({ searchParams }: AdminApplicationsPageProps) {
  await connection();
  const resolvedParams = await searchParams;

  const search = resolvedParams.search || '';
  const statusParam = (resolvedParams.status as ApplicationStatus | 'all') || 'all';
  const jobId = resolvedParams.jobId || 'all';
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 15;

  const [{ applications, total }, { jobs: allJobs }] = await Promise.all([
    getAdminApplications({
      search,
      status: statusParam,
      jobId: jobId !== 'all' ? jobId : undefined,
      page,
      limit,
    }),
    getAdminJobs({ limit: 100 }),
  ]);

  return (
    <ApplicationsClient
      initialApplications={applications}
      availableJobs={allJobs}
      initialTotal={total}
      initialPage={page}
      initialLimit={limit}
      initialStatus={statusParam}
      initialSearch={search}
      initialJobId={jobId}
    />
  );
}

export default function AdminApplicationsPage({ searchParams }: AdminApplicationsPageProps) {
  return (
    <React.Suspense fallback={<ApplicationsSkeleton />}>
      <ApplicationsDataContent searchParams={searchParams} />
    </React.Suspense>
  );
}
