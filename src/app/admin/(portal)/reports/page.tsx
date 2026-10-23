import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminReports } from '@/lib/data/admin';
import { JobReportStatus } from '@/types/database';
import { ReportsClient } from './reports-client';

export const metadata: Metadata = {
  title: 'Job Issue Reports | Admin Portal',
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
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
