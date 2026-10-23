import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminReports } from '@/lib/data/admin';
import { JobReportStatus } from '@/types/database';
import { ReportsClient } from './reports-client';

export const metadata: Metadata = {
  title: 'Job Issue Reports | Admin Portal',
};

interface AdminReportsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-testid="reports-skeleton">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-96" />
        </div>
      </div>

      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-44" />

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        ))}
      </div>
    </div>
  );
}

async function ReportsDataContent({ searchParams }: AdminReportsPageProps) {
  await connection();
  const resolvedParams = await searchParams;

  const statusParam = (resolvedParams.status as JobReportStatus | 'all') || 'all';
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 15;

  const { reports, total } = await getAdminReports({
    status: statusParam,
    page,
    limit,
  });

  return (
    <ReportsClient
      initialReports={reports}
      initialTotal={total}
      initialPage={page}
      initialLimit={limit}
      initialStatus={statusParam}
    />
  );
}

export default function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  return (
    <React.Suspense fallback={<ReportsSkeleton />}>
      <ReportsDataContent searchParams={searchParams} />
    </React.Suspense>
  );
}
