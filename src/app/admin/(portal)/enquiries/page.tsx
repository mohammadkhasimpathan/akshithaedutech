import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminEnquiries } from '@/lib/data/admin';
import { EnquiryStatus } from '@/types/database';
import { EnquiriesClient } from './enquiries-client';

export const metadata: Metadata = {
  title: 'Candidate Enquiries | Admin Portal',
};

interface AdminEnquiriesPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

function EnquiriesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-testid="enquiries-skeleton">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-96" />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-40" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        ))}
      </div>
    </div>
  );
}

async function EnquiriesDataContent({ searchParams }: AdminEnquiriesPageProps) {
  await connection();
  const resolvedParams = await searchParams;

  const search = resolvedParams.search || '';
  const statusParam = (resolvedParams.status as EnquiryStatus | 'all') || 'all';
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 15;

  const { enquiries, total } = await getAdminEnquiries({
    search,
    status: statusParam,
    page,
    limit,
  });

  return (
    <EnquiriesClient
      initialEnquiries={enquiries}
      initialTotal={total}
      initialPage={page}
      initialLimit={limit}
      initialStatus={statusParam}
      initialSearch={search}
    />
  );
}

export default function AdminEnquiriesPage({ searchParams }: AdminEnquiriesPageProps) {
  return (
    <React.Suspense fallback={<EnquiriesSkeleton />}>
      <EnquiriesDataContent searchParams={searchParams} />
    </React.Suspense>
  );
}
