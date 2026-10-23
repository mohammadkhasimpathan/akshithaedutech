import * as React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getAdminEnquiries } from '@/lib/data/admin';
import { EnquiryStatus } from '@/types/database';
import { EnquiriesClient } from './enquiries-client';

export const metadata: Metadata = {
  title: 'Candidate Enquiries | Admin Portal',
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
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
