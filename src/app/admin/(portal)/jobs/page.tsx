import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminJobs } from '@/lib/data/admin';
import { JobStatus } from '@/types/database';
import { JobsClient } from './jobs-client';

export const metadata: Metadata = {
  title: 'Job Postings Management | Admin Portal',
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
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
