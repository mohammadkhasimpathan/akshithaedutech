import * as React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getAdminJobById } from '@/lib/data/admin';
import { JobForm } from '../../job-form';

export const metadata: Metadata = {
  title: 'Edit Job Posting | Admin Portal',
};

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

function EditJobSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-testid="edit-job-skeleton">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function EditJobDataContent({ params }: EditJobPageProps) {
  await connection();
  const { id } = await params;
  const job = await getAdminJobById(id);

  if (!job) {
    notFound();
  }

  return <JobForm initialJob={job} />;
}

export default function EditJobPage({ params }: EditJobPageProps) {
  return (
    <React.Suspense fallback={<EditJobSkeleton />}>
      <EditJobDataContent params={params} />
    </React.Suspense>
  );
}
