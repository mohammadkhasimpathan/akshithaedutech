import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminApplications, getAdminJobs } from '@/lib/data/admin';
import { ApplicationStatus } from '@/types/database';
import { ApplicationsClient } from './applications-client';

export const metadata: Metadata = {
  title: 'Candidate Applications | Admin Portal',
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    jobId?: string;
    page?: string;
  }>;
}) {
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
