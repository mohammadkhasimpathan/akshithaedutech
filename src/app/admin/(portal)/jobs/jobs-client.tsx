'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job, JobStatus } from '@/types/database';
import {
  updateAdminJobStatus,
  deleteAdminJob,
} from '@/app/actions/admin-job-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface JobsClientProps {
  initialJobs: Job[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialStatus: string;
  initialSearch: string;
}

export function JobsClient({
  initialJobs,
  initialTotal,
  initialPage,
  initialLimit,
  initialStatus,
  initialSearch,
}: JobsClientProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState(initialStatus);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [deleteModalJob, setDeleteModalJob] = React.useState<Job | null>(null);

  // Debounced filter submission
  const applyFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    params.set('page', '1');
    router.push(`/admin/jobs?${params.toString()}`);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatus(newStatus);
    applyFilters(search, newStatus);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, status);
  };

  const handleQuickStatusChange = async (jobId: string, newStatus: JobStatus) => {
    setLoadingAction(`status-${jobId}`);
    setActionError(null);
    try {
      const res = await updateAdminJobStatus(jobId, newStatus);
      if (!res.success) {
        setActionError(res.error || 'Failed to update job status.');
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalJob) return;
    setLoadingAction(`delete-${deleteModalJob.id}`);
    setActionError(null);

    try {
      const res = await deleteAdminJob(deleteModalJob.id);
      if (!res.success) {
        setActionError(res.error || 'Failed to delete job posting.');
      } else {
        setDeleteModalJob(null);
        router.refresh();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Job deletion failed.');
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusBadge = (jobStatus: JobStatus) => {
    switch (jobStatus) {
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'draft':
        return <Badge variant="warning">Draft</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{jobStatus}</Badge>;
    }
  };

  const totalPages = Math.ceil(initialTotal / initialLimit) || 1;

  const navigatePage = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    params.set('page', String(newPage));
    router.push(`/admin/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Job Postings Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, review, and manage the publishing lifecycle of verified positions.
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="shadow-sm shadow-blue-500/20">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Job Posting
          </Button>
        </Link>
      </div>

      {actionError && (
        <div
          role="alert"
          className="p-4 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 flex items-start justify-between gap-2"
        >
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, category, or slug..."
            className="w-full"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                applyFilters('', status);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'published', 'draft', 'closed', 'archived'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusFilterChange(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                status === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category & Location</th>
                <th className="px-4 py-4">Work Mode</th>
                <th className="px-4 py-4 text-center">Openings</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No job postings found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                initialJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {job.title}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        /{job.slug}
                      </div>
                      {job.featured && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-slate-100">{job.category}</div>
                      <div className="text-xs text-slate-500">{job.location}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs capitalize px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                        {job.work_mode}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {job.openings}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(job.status)}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(job.updated_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Switcher Quick Menu */}
                        {job.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            disabled={loadingAction === `status-${job.id}`}
                            onClick={() => handleQuickStatusChange(job.id, 'published')}
                          >
                            Publish
                          </Button>
                        )}
                        {job.status === 'published' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                            disabled={loadingAction === `status-${job.id}`}
                            onClick={() => handleQuickStatusChange(job.id, 'closed')}
                          >
                            Close
                          </Button>
                        )}
                        {job.status === 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                            disabled={loadingAction === `status-${job.id}`}
                            onClick={() => handleQuickStatusChange(job.id, 'published')}
                          >
                            Reopen
                          </Button>
                        )}

                        {/* Edit Button */}
                        <Link href={`/admin/jobs/${job.id}/edit`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Edit
                          </Button>
                        </Link>

                        {/* Public Link */}
                        {job.status === 'published' && (
                          <Link href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="h-8 text-xs text-blue-600">
                              View ↗
                            </Button>
                          </Link>
                        )}

                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => setDeleteModalJob(job)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {initialPage} of {totalPages} ({initialTotal} total jobs)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={initialPage <= 1}
                onClick={() => navigatePage(initialPage - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={initialPage >= totalPages}
                onClick={() => navigatePage(initialPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete Action */}
      {deleteModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirm Job Deletion
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {deleteModalJob.title}
                </strong>
                ?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                <strong>Data Protection Safeguard:</strong> In accordance with database foreign key integrity, if candidate applications exist for this job, deletion will be strictly rejected. In that case, please close or archive the position instead.
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteModalJob(null)}
                disabled={loadingAction === `delete-${deleteModalJob.id}`}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={loadingAction === `delete-${deleteModalJob.id}`}
              >
                {loadingAction === `delete-${deleteModalJob.id}` ? 'Deleting...' : 'Confirm Deletion'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
