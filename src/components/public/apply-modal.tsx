'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Job } from '@/types/database';
import { submitCandidateApplication } from '@/app/actions/application-actions';
import { CheckCircle2, Upload, AlertCircle, FileText } from 'lucide-react';

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyModal({ job, isOpen, onClose }: ApplyModalProps) {
  if (!isOpen || !job) return null;
  return <ApplyModalContent job={job} onClose={onClose} />;
}

function ApplyModalContent({ job, onClose }: { job: Job; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [submissionResult, setSubmissionResult] = React.useState<{
    success: boolean;
    referenceId?: string;
    candidateName?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only genuine PDF documents are accepted.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Resume file size must not exceed 5 MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!selectedFile) {
      setFileError('Please upload your PDF resume to complete the application.');
      return;
    }

    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set('job_id', job.id);
      formData.set('resume', selectedFile);

      const response = await submitCandidateApplication(formData);

      if (response.success && response.referenceId) {
        setSubmissionResult({
          success: true,
          referenceId: response.referenceId,
          candidateName: response.candidateName,
        });
      } else {
        setFormError(response.error || 'Failed to submit application.');
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setFormError(`An unexpected error occurred: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title={submissionResult ? 'Application Received' : `Apply: ${job.title}`}
      description={
        submissionResult
          ? 'Your application details have been securely recorded.'
          : `${job.company_name} • ${job.location} • No account required`
      }
      maxWidth="lg"
    >
      {submissionResult ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Application Submitted Successfully!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Thank you, <span className="font-semibold text-slate-900 dark:text-white">{submissionResult.candidateName}</span>. Your resume has been stored in private storage for the hiring team.
            </p>
          </div>

          <div className="mx-auto max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
            <span className="block text-slate-400 font-medium uppercase tracking-wider">
              Application Reference ID
            </span>
            <span className="mt-1 block font-mono text-sm font-bold text-blue-600 dark:text-blue-400 break-all select-all">
              {submissionResult.referenceId}
            </span>
            <span className="mt-2 block text-[11px] text-slate-500">
              Keep this reference ID for any follow-up enquiries with our career support team.
            </span>
          </div>

          <div className="pt-2">
            <Button onClick={onClose} className="w-full sm:w-auto px-8">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Honeypot field (hidden from legitimate users) */}
          <input
            type="text"
            name="website_hp"
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            defaultValue=""
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                name="candidate_name"
                placeholder="e.g. Priya Sharma"
                required
                error={fieldErrors.candidate_name?.[0]}
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                placeholder="priya@example.com"
                required
                error={fieldErrors.email?.[0]}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                required
                error={fieldErrors.phone?.[0]}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current City <span className="text-rose-500">*</span>
              </label>
              <Input
                name="city"
                placeholder="e.g. Bengaluru, Hyderabad"
                required
                error={fieldErrors.city?.[0]}
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Highest Education <span className="text-rose-500">*</span>
              </label>
              <Input
                name="education"
                placeholder="e.g. B.Tech Computer Science, MCA"
                required
                error={fieldErrors.education?.[0]}
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Years of Experience <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                name="experience_years"
                min="0"
                max="50"
                step="0.5"
                defaultValue={job.experience_min === 0 ? 0 : job.experience_min}
                required
                error={fieldErrors.experience_years?.[0]}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Freshers and recent graduates enter <strong className="text-slate-600 dark:text-slate-300">0</strong>.
              </p>
            </div>
          </div>

          {/* Cover Letter (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Note or Project Summary (Optional)
            </label>
            <Textarea
              name="cover_letter"
              rows={3}
              placeholder="Briefly highlight your key projects, internships, or why you're interested in this role..."
              error={fieldErrors.cover_letter?.[0]}
            />
          </div>

          {/* PDF Resume Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              PDF Resume <span className="text-rose-500">*</span> <span className="text-slate-400 font-normal">(Max 5 MB, PDF only)</span>
            </label>

            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
              <input
                type="file"
                name="resume"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />

              <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                {selectedFile ? (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-xs">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      Click or drag & drop your <strong className="text-blue-600">PDF resume</strong> here
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Resumes are encrypted & stored in private storage
                    </span>
                  </>
                )}
              </div>
            </div>
            {fileError && <p className="mt-1 text-xs text-rose-500 font-medium">{fileError}</p>}
            {fieldErrors.resume && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.resume[0]}</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              value="true"
              required
              className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
              I consent to Akshitha Edutech storing and processing my contact details and resume solely for evaluating private-sector employment opportunities. <span className="text-rose-500">*</span>
            </label>
          </div>
          {fieldErrors.consent && (
            <p className="text-xs text-rose-500 font-medium">{fieldErrors.consent[0]}</p>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="min-w-[140px]">
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
