import * as React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { JobsBrowser } from '@/components/public/jobs-browser';
import { getPublishedJobs } from '@/lib/data/jobs';
import { WorkMode, EmploymentType } from '@/types/database';

export const metadata: Metadata = {
  title: 'Browse Private Sector Jobs | Akshitha Edutech',
  description:
    'Explore verified job vacancies for freshers and experienced candidates. Direct applications with no candidate login required.',
};

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function JobsBrowserSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-testid="jobs-browser-skeleton">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="h-11 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="flex gap-2">
          <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-56 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3"
          />
        ))}
      </div>
    </div>
  );
}

async function JobsBrowserContent({ searchParams }: JobsPageProps) {
  const resolvedParams = await searchParams;

  const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const expParam = typeof resolvedParams.exp === 'string' ? resolvedParams.exp : undefined;
  const modeParam = typeof resolvedParams.mode === 'string' ? (resolvedParams.mode as WorkMode) : undefined;
  const typeParam = typeof resolvedParams.type === 'string' ? (resolvedParams.type as EmploymentType) : undefined;
  const catParam = typeof resolvedParams.cat === 'string' ? resolvedParams.cat : undefined;
  const locParam = typeof resolvedParams.loc === 'string' ? resolvedParams.loc : undefined;
  const sortParam =
    resolvedParams.sort === 'newest' || resolvedParams.sort === 'salary_high'
      ? resolvedParams.sort
      : 'featured';
  const pageParam = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;

  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  const experienceType =
    expParam === 'fresher' ? 'fresher' : expParam === 'experienced' ? 'experienced' : 'all';

  const { jobs, count } = await getPublishedJobs(null, {
    searchQuery,
    experienceType,
    workMode: modeParam,
    employmentType: typeParam,
    category: catParam,
    location: locParam,
    sortBy: sortParam,
    limit: pageSize,
    offset,
  });

  return (
    <JobsBrowser
      initialJobs={jobs}
      totalCount={count}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
}

export default function JobsPage({ searchParams }: JobsPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Private Sector Careers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Direct candidate applications • Resumes stored securely • English language only
            </p>
          </div>

          {/* Interactive Browser with Suspense Boundary */}
          <React.Suspense fallback={<JobsBrowserSkeleton />}>
            <JobsBrowserContent searchParams={searchParams} />
          </React.Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
