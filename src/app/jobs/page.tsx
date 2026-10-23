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

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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

          {/* Interactive Browser with Filter Tabs and Job Cards */}
          <JobsBrowser
            initialJobs={jobs}
            totalCount={count}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
