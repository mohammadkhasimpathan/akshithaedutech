import * as React from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { getAdminDashboardMetrics } from '@/lib/data/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Dashboard | Admin Portal',
};

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" data-testid="dashboard-skeleton">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-36">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-4" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-96">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-40 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-96">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-36 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'published':
    case 'resolved':
    case 'shortlisted':
      return <Badge variant="success">{status}</Badge>;
    case 'pending':
    case 'in_progress':
      return <Badge variant="warning">{status}</Badge>;
    case 'draft':
    case 'new':
      return <Badge variant="info">{status}</Badge>;
    case 'closed':
    case 'rejected':
    case 'dismissed':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

async function DashboardMetricsContent() {
  await connection();
  const metrics = await getAdminDashboardMetrics();

  return (
    <>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Applications Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Applications
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.applications.total}
            </span>
            {metrics.applications.pending > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {metrics.applications.pending} pending
              </span>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{metrics.applications.shortlisted} shortlisted</span>
            <span>{metrics.applications.reviewed} reviewed</span>
          </div>
        </div>

        {/* Job Postings Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Job Postings
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.jobs.published}
            </span>
            <span className="text-xs text-slate-500">published</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{metrics.jobs.draft} drafts</span>
            <span>{metrics.jobs.closed} closed</span>
          </div>
        </div>

        {/* Candidate Enquiries Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enquiries
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.enquiries.unresolved}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              unresolved
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{metrics.enquiries.new} new</span>
            <span>{metrics.enquiries.resolved} resolved</span>
          </div>
        </div>

        {/* Job Reports Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Issue Reports
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.reports.pending}
            </span>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
              pending review
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{metrics.reports.reviewed} reviewed</span>
            <span>{metrics.reports.dismissed} dismissed</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent System Activity
            </h2>
            <span className="text-xs text-slate-400">Latest 10 events</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {metrics.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No recent activity recorded yet.
              </p>
            ) : (
              metrics.recentActivity.map((item) => (
                <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {item.type === 'application' && (
                        <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 inline-block">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                      )}
                      {item.type === 'enquiry' && (
                        <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 inline-block">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </span>
                      )}
                      {item.type === 'report' && (
                        <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 inline-block">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </span>
                      )}
                      {item.type === 'job' && (
                        <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 inline-block">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.subtitle}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">
                        {new Date(item.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Direct Admin Shortcuts
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/admin/jobs/new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Create New Job Posting
                </span>
                <span className="text-slate-400">→</span>
              </Link>

              <Link
                href="/admin/applications?status=pending"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Pending Candidate Applications
                </span>
                <Badge variant="warning">{metrics.applications.pending}</Badge>
              </Link>

              <Link
                href="/admin/enquiries?status=new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  New Candidate Enquiries
                </span>
                <Badge variant="info">{metrics.enquiries.new}</Badge>
              </Link>

              <Link
                href="/admin/reports?status=pending"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Pending Issue Reports
                </span>
                <Badge variant="destructive">{metrics.reports.pending}</Badge>
              </Link>
            </div>
          </div>

          {/* Operational Security Note */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Enterprise Security Enforced
            </h3>
            <p className="text-xs text-blue-200 mt-2 leading-relaxed">
              Candidate resumes and PII are restricted. Signed resume URLs expire in 60 seconds and are verified against database application records.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time candidate pipeline, job posting lifecycle, and communication inbox metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/jobs/new">
            <Button className="shadow-sm shadow-blue-500/20">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Job
            </Button>
          </Link>
          <Link href="/admin/applications">
            <Button variant="outline">
              Review Applications
            </Button>
          </Link>
        </div>
      </div>

      <React.Suspense fallback={<DashboardSkeleton />}>
        <DashboardMetricsContent />
      </React.Suspense>
    </div>
  );
}
