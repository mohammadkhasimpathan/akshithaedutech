'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { JobReportStatus } from '@/types/database';
import { ReportWithJob } from '@/lib/data/admin';
import { updateJobReportStatusAction } from '@/app/actions/admin-inbox-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ReportsClientProps {
  initialReports: ReportWithJob[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialStatus: string;
}

export function ReportsClient({
  initialReports,
  initialTotal,
  initialPage,
  initialLimit,
  initialStatus,
}: ReportsClientProps) {
  const router = useRouter();

  const [status, setStatus] = React.useState(initialStatus);
  const [selectedReport, setSelectedReport] = React.useState<ReportWithJob | null>(null);
  const [reportStatus, setReportStatus] = React.useState<JobReportStatus>('pending');
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const applyStatusFilter = (newStatus: string) => {
    const params = new URLSearchParams();
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    params.set('page', '1');
    router.push(`/admin/reports?${params.toString()}`);
  };

  const handleOpenDetail = (r: ReportWithJob) => {
    setSelectedReport(r);
    setReportStatus(r.status);
    setMessage(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedReport) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await updateJobReportStatusAction(selectedReport.id, reportStatus);
      if (!res.success) {
        setMessage({ text: res.error || 'Failed to update report status.', type: 'error' });
      } else {
        setMessage({ text: 'Report status updated successfully.', type: 'success' });
        setSelectedReport({
          ...selectedReport,
          status: reportStatus,
        });
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : 'Error updating report status.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st: JobReportStatus) => {
    switch (st) {
      case 'reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>;
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge>{st}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'expired_position':
        return 'Expired Position';
      case 'incorrect_info':
        return 'Incorrect Information';
      case 'offensive_content':
        return 'Offensive Content';
      case 'suspected_scam':
        return 'Suspected Scam';
      default:
        return reason.replace('_', ' ');
    }
  };

  const totalPages = Math.ceil(initialTotal / initialLimit) || 1;

  const navigatePage = (newPage: number) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    params.set('page', String(newPage));
    router.push(`/admin/reports?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Job Posting Issue Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Community and candidate feedback on posting accuracy, expiry status, and compliance concerns.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Filter by Status:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'pending', 'reviewed', 'dismissed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                applyStatusFilter(s);
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

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Reported Job</th>
                <th className="px-4 py-4">Reason Category</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Issue Details</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Reported At</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No issue reports found for the selected status filter.
                  </td>
                </tr>
              ) : (
                initialReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => handleOpenDetail(report)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {report.job_title}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {getReasonLabel(report.reason)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {report.reporter_name || 'Anonymous'}
                      </div>
                      <div className="text-slate-500">{report.reporter_email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      {report.details}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(report.status)}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString('en-IN', {
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
                        onClick={() => handleOpenDetail(report)}
                      >
                        Review
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
              Page {initialPage} of {totalPages} ({initialTotal} reports)
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

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400">
                  Issue Report Details
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {getReasonLabel(selectedReport.reason)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reported on {new Date(selectedReport.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>

            {/* Job and Reporter Info */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div>
                  <span className="text-slate-400">Target Position:</span>{' '}
                  <strong className="text-slate-900 dark:text-slate-100">{selectedReport.job_title}</strong>
                </div>
                {selectedReport.job_slug && (
                  <div>
                    <Link
                      href={`/jobs/${selectedReport.job_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Live Posting ↗
                    </Link>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Reporter:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedReport.reporter_name || 'Anonymous'} ({selectedReport.reporter_email})
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Report Details & Context
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedReport.details}
                </div>
              </div>
            </div>

            {/* Status Updater */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Administrative Determination
              </h4>

              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    message.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div>
                <label htmlFor="report-status-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Audit Status:
                </label>
                <select
                  id="report-status-select"
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value as JobReportStatus)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="pending">Pending Investigation</option>
                  <option value="reviewed">Reviewed & Actioned</option>
                  <option value="dismissed">Dismissed (No Action Required)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                <Button onClick={handleSaveStatus} disabled={saving}>
                  {saving ? 'Saving...' : 'Update Status'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
