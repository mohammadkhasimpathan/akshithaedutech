'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Job } from '@/types/database';
import { submitJobReport } from '@/app/actions/report-actions';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ job, isOpen, onClose }: ReportModalProps) {
  if (!isOpen || !job) return null;
  return <ReportModalContent job={job} onClose={onClose} />;
}

function ReportModalContent({ job, onClose }: { job: Job; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const payload = {
        job_id: job.id,
        reporter_name: (formData.get('reporter_name') as string) || null,
        reporter_email: (formData.get('reporter_email') as string) || '',
        reason: (formData.get('reason') as string) || '',
        details: (formData.get('details') as string) || '',
        website_hp: (formData.get('website_hp') as string) || '',
      };

      const response = await submitJobReport(payload);

      if (response.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(response.error || 'Failed to submit report.');
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setErrorMessage(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title={isSuccess ? 'Report Received' : `Flag Listing: ${job.title}`}
      description={
        isSuccess
          ? 'Thank you for helping us maintain verified, quality opportunities.'
          : 'Report inaccurate information, suspected fraud, or an already-closed vacancy.'
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Thank You for Your Feedback
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Our compliance and verification team will audit this job listing promptly.
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={onClose} className="px-6">
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Honeypot field */}
          <input
            type="text"
            name="website_hp"
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            defaultValue=""
          />

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Flagging <span className="text-rose-500">*</span>
            </label>
            <select
              name="reason"
              required
              className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="incorrect_info">Inaccurate salary or job description</option>
              <option value="expired_position">Position is already closed / filled</option>
              <option value="suspected_scam">Suspected fraudulent or suspicious employer</option>
              <option value="offensive_content">Inappropriate or discriminatory content</option>
              <option value="other">Other compliance concern</option>
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Details & Explanation <span className="text-rose-500">*</span>
            </label>
            <Textarea
              name="details"
              rows={3}
              placeholder="Describe what is inaccurate or why this job should be audited..."
              required
              error={fieldErrors.details?.[0]}
            />
          </div>

          {/* Reporter Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              name="reporter_email"
              placeholder="you@example.com"
              required
              error={fieldErrors.reporter_email?.[0]}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Used strictly for follow-up if our compliance team needs more context.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              isLoading={isSubmitting}
              className="min-w-[120px]"
            >
              Flag Job
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
