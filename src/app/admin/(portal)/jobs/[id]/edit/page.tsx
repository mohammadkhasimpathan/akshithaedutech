import * as React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getAdminJobById } from '@/lib/data/admin';
import { JobForm } from '../../job-form';

export const metadata: Metadata = {
  title: 'Edit Job Posting | Admin Portal',
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const job = await getAdminJobById(id);

  if (!job) {
    notFound();
  }

  return <JobForm initialJob={job} />;
}
