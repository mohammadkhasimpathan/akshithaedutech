'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationStatus, Job } from '@/types/database';
import { ApplicationWithJob } from '@/lib/data/admin';
import {
  updateApplicationReview,
  getSecureResumeDownloadUrlAction,
} from '@/app/actions/admin-application-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ApplicationsClientProps {
  initialApplications: ApplicationWithJob[];
  availableJobs: Job[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialStatus: string;
  initialSearch: string;
  initialJobId: string;
}

export function ApplicationsClient({
  initialApplications,
  availableJobs,
  initialTotal,
  initialPage,
  initialLimit,
  initialStatus,
  initialSearch,
  initialJobId,
}: ApplicationsClientProps) {
  const router = useRouter();

  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState(initialStatus);
  const [jobId, setJobId] = React.useState(initialJobId);

  // Selected application for detail review drawer
  const [selectedApp, setSelectedApp] = React.useState<ApplicationWithJob | null>(null);
  const [reviewStatus, setReviewStatus] = React.useState<ApplicationStatus>('pending');
  const [internalNotes, setInternalNotes] = React.useState<string>('');
  const [savingReview, setSavingReview] = React.useState(false);
  const [reviewMessage, setReviewMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Resume download state
  const [downloadingResume, setDownloadingResume] = React.useState(false);
  const [resumeError, setResumeError] = React.useState<string | null>(null);

  const applyFilters = (newSearch: string, newStatus: string, newJobId: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    if (newJobId && newJobId !== 'all') params.set('jobId', newJobId);
    params.set('page', '1');
    router.push(`/admin/applications?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, status, jobId);
  };

  const handleOpenDetail = (app: ApplicationWithJob) => {
    setSelectedApp(app);
    setReviewStatus(app.status);
    setInternalNotes(app.internal_notes || '');
    setReviewMessage(null);
    setResumeError(null);
  };

  const handleSaveReview = async () => {
    if (!selectedApp) return;
    setSavingReview(true);
    setReviewMessage(null);

    try {
      const res = await updateApplicationReview(selectedApp.id, reviewStatus, internalNotes);
      if (!res.success) {
        setReviewMessage({ text: res.error || 'Failed to update review.', type: 'error' });
      } else {
        setReviewMessage({ text: 'Review status and internal notes saved successfully.', type: 'success' });
        setSelectedApp({
          ...selectedApp,
          status: reviewStatus,
          internal_notes: internalNotes,
        });
        router.refresh();
      }
    } catch (err: unknown) {
      setReviewMessage({
        text: err instanceof Error ? err.message : 'Error updating application review.',
        type: 'error',
      });
    } finally {
      setSavingReview(false);
    }
  };

  const handleDownloadResume = async (applicationId: string) => {
    setDownloadingResume(true);
    setResumeError(null);

    try {
      const res = await getSecureResumeDownloadUrlAction(applicationId);
      if (!res.success || !res.signedUrl) {
        setResumeError(res.error || 'Failed to generate secure resume download URL.');
      } else {
        // Open signed short-lived URL in separate window/tab
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      setResumeError(err instanceof Error ? err.message : 'Resume download failed.');
    } finally {
      setDownloadingResume(false);
    }
  };

  const getStatusBadge = (appStatus: ApplicationStatus) => {
    switch (appStatus) {
      case 'shortlisted':
        return <Badge variant="success">Shortlisted</Badge>;
      case 'reviewed':
        return <Badge variant="info">Reviewed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{appStatus}</Badge>;
    }
  };

  const totalPages = Math.ceil(initialTotal / initialLimit) || 1;

  const navigatePage = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    if (jobId && jobId !== 'all') params.set('jobId', jobId);
    params.set('page', String(newPage));
    router.push(`/admin/applications?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Candidate Applications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review applicant qualifications, update candidate pipeline stages, and access authorized resumes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, email, phone, or city..."
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
                applyFilters('', status, jobId);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Job selector filter */}
        <div className="w-full md:w-64">
          <select
            value={jobId}
            onChange={(e) => {
              setJobId(e.target.value);
              applyFilters(search, status, e.target.value);
            }}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
          >
            <option value="all">All Positions ({availableJobs.length})</option>
            {availableJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'pending', 'reviewed', 'shortlisted', 'rejected'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                applyFilters(search, s, jobId);
              }}
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

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Position Applied</th>
                <th className="px-4 py-4">Education & Exp</th>
                <th className="px-4 py-4">City</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Submitted At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No candidate applications match the selected filters.
                  </td>
                </tr>
              ) : (
                initialApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => handleOpenDetail(app)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {app.candidate_name}
                      </div>
                      <div className="text-xs text-slate-500">{app.email}</div>
                      <div className="text-xs text-slate-400">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {app.job_title}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {app.education}
                      </div>
                      <div className="text-slate-500">
                        {app.experience_years === 0
                          ? 'Fresher (0 yrs)'
                          : `${app.experience_years} years`}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {app.city}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleOpenDetail(app)}
                      >
                        Review Application
                      </Button>
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
              Page {initialPage} of {totalPages} ({initialTotal} applications)
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

      {/* Application Detail Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400">
                  Applicant Dossier
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedApp.candidate_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied for <strong className="text-slate-700 dark:text-slate-300">{selectedApp.job_title}</strong> on{' '}
                  {new Date(selectedApp.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>

            {/* Candidate Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Email Address:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone Number:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Current City:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.city}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Experience Level:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedApp.experience_years === 0
                    ? 'Fresher (0 years)'
                    : `${selectedApp.experience_years} years`}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium">Education Background:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.education}</span>
              </div>
            </div>

            {/* Candidate Cover Letter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Cover Letter / Personal Statement
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {selectedApp.cover_letter || (
                  <span className="text-slate-400 italic">No cover letter submitted by candidate.</span>
                )}
              </div>
            </div>

            {/* Resume Access Section */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedApp.resume_original_name || 'Resume.pdf'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Access restricted to authorized administrators. Generates short-lived 60-second signed URL.
                </p>
                {resumeError && (
                  <p className="text-xs text-rose-600 mt-1">{resumeError}</p>
                )}
              </div>
              <Button
                size="sm"
                className="shrink-0 shadow-sm"
                onClick={() => handleDownloadResume(selectedApp.id)}
                disabled={downloadingResume}
              >
                {downloadingResume ? 'Generating Link...' : 'Download Resume ↗'}
              </Button>
            </div>

            {/* Administrative Review & Internal Notes */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Administrative Triage & Notes
              </h4>

              {reviewMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    reviewMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {reviewMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="review-status-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Application Review Status:
                  </label>
                  <select
                    id="review-status-select"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as ApplicationStatus)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted for Interview</option>
                    <option value="rejected">Rejected / Not Proceeding</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="admin-internal-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Private Internal Notes
                  </label>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Strictly private — never visible to candidate
                  </span>
                </div>
                <Textarea
                  id="admin-internal-notes"
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record interviewer impressions, scorecards, or follow-up details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
                <Button onClick={handleSaveReview} disabled={savingReview}>
                  {savingReview ? 'Saving Changes...' : 'Save Review & Notes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
