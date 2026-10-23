'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, Briefcase, GraduationCap, Users } from 'lucide-react';
import { Job, WorkMode, EmploymentType } from '@/types/database';
import { JobCard } from '@/components/public/job-card';
import { ApplyModal } from '@/components/public/apply-modal';
import { Button } from '@/components/ui/button';

interface JobsBrowserProps {
  initialJobs: Job[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function JobsBrowser({
  initialJobs,
  totalCount,
  currentPage,
  pageSize,
}: JobsBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedJobForApply, setSelectedJobForApply] = React.useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);

  // Active filter values from URL
  const currentQuery = searchParams.get('q') || '';
  const currentExp = searchParams.get('exp') || 'all';
  const currentMode = searchParams.get('mode') || '';
  const currentType = searchParams.get('type') || '';
  const currentCat = searchParams.get('cat') || '';
  const currentLoc = searchParams.get('loc') || '';
  const currentSort = searchParams.get('sort') || 'featured';

  const [searchInput, setSearchInput] = React.useState(currentQuery);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset to page 1 on filter change
    params.delete('page');
    router.push(`/jobs?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    router.push('/jobs');
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJobForApply(job);
    setIsApplyModalOpen(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const hasActiveFilters =
    currentQuery !== '' ||
    currentExp !== 'all' ||
    currentMode !== '' ||
    currentType !== '' ||
    currentCat !== '' ||
    currentLoc !== '' ||
    currentSort !== 'featured';

  return (
    <div className="space-y-6">
      {/* Search and Primary Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFilters({ q: searchInput.trim() });
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, department, or technology..."
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <Button type="submit" className="h-11 px-6">
            Search
          </Button>
        </form>

        {/* Experience Level Pill Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Experience:
          </span>

          <button
            type="button"
            onClick={() => updateFilters({ exp: 'all' })}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              currentExp === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Experience Levels
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ exp: 'fresher' })}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              currentExp === 'fresher'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Freshers (0-1 yrs)
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ exp: 'experienced' })}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              currentExp === 'experienced'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Experienced Roles (2+ yrs)
          </button>
        </div>

        {/* Secondary Filters Dropdowns */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          {/* Work Mode */}
          <select
            value={currentMode}
            onChange={(e) => updateFilters({ mode: e.target.value as WorkMode })}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <option value="">All Work Modes</option>
            <option value="on-site">On-Site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote Only</option>
          </select>

          {/* Employment Type */}
          <select
            value={currentType}
            onChange={(e) => updateFilters({ type: e.target.value as EmploymentType })}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>

          {/* Location */}
          <select
            value={currentLoc}
            onChange={(e) => updateFilters({ loc: e.target.value })}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <option value="">All Locations</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Remote">Remote</option>
          </select>

          {/* Sort By */}
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <option value="featured">Sort: Featured First</option>
            <option value="newest">Sort: Newest First</option>
            <option value="salary_high">Sort: Salary (High to Low)</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors ml-auto font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{initialJobs.length}</strong> of{' '}
          <strong className="text-slate-900 dark:text-white">{totalCount}</strong> verified vacancies
        </span>
        {currentExp === 'fresher' && (
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            Filtering: Entry-Level / Freshers Only
          </span>
        )}
      </div>

      {/* Job Cards Grid */}
      {initialJobs.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching opportunities found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing specific filters to see other available vacancies.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialJobs.map((job) => (
            <JobCard key={job.id} job={job} onApplyClick={handleApplyClick} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', pageNum.toString());
                  router.push(`/jobs?${params.toString()}`);
                }}
                className={`h-9 w-9 rounded-xl text-xs font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

      {/* Application Modal */}
      <ApplyModal
        job={selectedJobForApply}
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedJobForApply(null);
        }}
      />
    </div>
  );
}
