'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Enquiry, EnquiryStatus } from '@/types/database';
import { updateEnquiryStatusAction } from '@/app/actions/admin-inbox-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface EnquiriesClientProps {
  initialEnquiries: Enquiry[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialStatus: string;
  initialSearch: string;
}

export function EnquiriesClient({
  initialEnquiries,
  initialTotal,
  initialPage,
  initialLimit,
  initialStatus,
  initialSearch,
}: EnquiriesClientProps) {
  const router = useRouter();

  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState(initialStatus);

  const [selectedEnquiry, setSelectedEnquiry] = React.useState<Enquiry | null>(null);
  const [resolutionStatus, setResolutionStatus] = React.useState<EnquiryStatus>('new');
  const [internalNotes, setInternalNotes] = React.useState<string>('');
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const applyFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    params.set('page', '1');
    router.push(`/admin/enquiries?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, status);
  };

  const handleOpenDetail = (item: Enquiry) => {
    setSelectedEnquiry(item);
    setResolutionStatus(item.status);
    setInternalNotes(item.internal_notes || '');
    setMessage(null);
  };

  const handleSaveResolution = async () => {
    if (!selectedEnquiry) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await updateEnquiryStatusAction(
        selectedEnquiry.id,
        resolutionStatus,
        internalNotes
      );
      if (!res.success) {
        setMessage({ text: res.error || 'Failed to update enquiry.', type: 'error' });
      } else {
        setMessage({ text: 'Enquiry status and internal notes saved successfully.', type: 'success' });
        setSelectedEnquiry({
          ...selectedEnquiry,
          status: resolutionStatus,
          internal_notes: internalNotes,
        });
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : 'Error updating enquiry status.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st: EnquiryStatus) => {
    switch (st) {
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'new':
        return <Badge variant="info">New</Badge>;
      default:
        return <Badge>{st}</Badge>;
    }
  };

  const totalPages = Math.ceil(initialTotal / initialLimit) || 1;

  const navigatePage = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    params.set('page', String(newPage));
    router.push(`/admin/enquiries?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Candidate & Partner Enquiries
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Triage visitor questions, career guidance requests, and prospective inquiries with private audit notes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or message keyword..."
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

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'new', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                applyFilters(search, s);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                status === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Sender</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-6 py-4">Message Snippet</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Received At</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No enquiries match the specified filters.
                  </td>
                </tr>
              ) : (
                initialEnquiries.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">{item.email}</div>
                      {item.phone && <div className="text-xs text-slate-400">{item.phone}</div>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 capitalize">
                        {item.enquiry_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      {item.message}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
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
                        onClick={() => handleOpenDetail(item)}
                      >
                        Triage
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
              Page {initialPage} of {totalPages} ({initialTotal} enquiries)
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

      {/* Enquiry Triage Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400">
                  Enquiry Details
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedEnquiry.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type: <strong className="capitalize">{selectedEnquiry.enquiry_type.replace('_', ' ')}</strong> • Received{' '}
                  {new Date(selectedEnquiry.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedEnquiry(null)}>
                Close
              </Button>
            </div>

            {/* Sender Contacts */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Email:</span>{' '}
                <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600 font-semibold underline">
                  {selectedEnquiry.email}
                </a>
              </div>
              {selectedEnquiry.phone && (
                <div>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEnquiry.phone}</span>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Inquiry Message
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Status & Private Notes */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Resolution & Internal Audit Notes
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
                <label htmlFor="enquiry-status-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resolution Status:
                </label>
                <select
                  id="enquiry-status-select"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as EnquiryStatus)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="new">New / Unaddressed</option>
                  <option value="in_progress">In Progress / Contacted</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="enquiry-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Private Resolution Notes
                  </label>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Strictly private — never exposed publicly
                  </span>
                </div>
                <Textarea
                  id="enquiry-notes"
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record summary of response provided, counsel delivered, or internal actions..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                  Close
                </Button>
                <Button onClick={handleSaveResolution} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Resolution'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
