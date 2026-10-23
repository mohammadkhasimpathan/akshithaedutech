'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitEmployerRegistration } from '@/app/actions/registration-actions';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const OPPORTUNITY_TYPES = [
  { id: 'full-time', label: 'Full-Time Engineering & Professional Roles' },
  { id: 'internship', label: 'Internships & Graduate Trainee Programs' },
  { id: 'campus-drive', label: 'Exclusive Campus Recruitment Drives' },
  { id: 'contract', label: 'Contract & Project-Based Hiring' },
];

const COLLABORATION_OPTIONS = [
  { id: 'campus_hiring', label: 'Campus Placement Partnerships' },
  { id: 'experienced_hiring', label: 'Lateral / Experienced Talent Sourcing' },
  { id: 'skill_workshops', label: 'Industry Readiness & Skill Workshops' },
  { id: 'custom_drives', label: 'Custom Corporate Hackathons & Hiring Drives' },
];

export default function EmployerRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [selectedOpportunities, setSelectedOpportunities] = React.useState<string[]>([
    'full-time',
    'internship',
  ]);
  const [selectedCollaborations, setSelectedCollaborations] = React.useState<string[]>([
    'campus_hiring',
  ]);

  const [result, setResult] = React.useState<{
    success: boolean;
    referenceId?: string;
    message?: string;
  } | null>(null);

  const toggleOpportunity = (id: string) => {
    setSelectedOpportunities((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCollaboration = (id: string) => {
    setSelectedCollaborations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (selectedOpportunities.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        opportunity_types: ['Please select at least one opportunity type.'],
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Append opportunity types
      formData.delete('opportunity_types');
      selectedOpportunities.forEach((o) => formData.append('opportunity_types', o));

      // Append collaboration interests
      formData.delete('collaboration_interests');
      selectedCollaborations.forEach((c) => formData.append('collaboration_interests', c));

      const res = await submitEmployerRegistration(formData);

      if (!res.success) {
        setFormError(res.error || 'Failed to submit employer registration.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      setResult({
        success: true,
        referenceId: res.referenceId,
        message: res.message,
      });
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'An unexpected error occurred during submission.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Employer Registration Submitted!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            {result.message}
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              Employer Reference ID
            </span>
            <p className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 mt-1">
              {result.referenceId}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 mb-8 text-left leading-relaxed">
            <p className="font-semibold mb-1">Administrative Verification Workflow:</p>
            To maintain high portal integrity and prevent unauthorized listings, all employer profiles are validated by our operations team before recruitment drives and job postings are published.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button className="w-full">Back to Home</Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button variant="outline" className="w-full">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Recruitment & Employer Partnerships</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Partner With Akshitha Edutech
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Connect with pre-screened freshers, engineering graduates, and qualified professionals. Submit your organization details to collaborate on campus recruitment, lateral hiring, and structured trainee drives.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Submissions undergo administrative verification before publication.</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
          {formError && (
            <div
              role="alert"
              className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {/* 1. Organization Details */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Company / Organization Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="company_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Company Name *
                  </label>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="e.g. NextGen Cloud Systems Pvt Ltd"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.company_name ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.company_name && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.company_name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="industry" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Industry Domain *
                  </label>
                  <Input
                    id="industry"
                    name="industry"
                    placeholder="e.g. Information Technology / Fintech"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.industry ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.industry && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.industry[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="office_location" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Headquarters / Office Location *
                  </label>
                  <Input
                    id="office_location"
                    name="office_location"
                    placeholder="e.g. Hyderabad, Telangana"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.office_location ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.office_location && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.office_location[0]}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="website" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Website (Optional)
                  </label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://company.example.com"
                    disabled={isSubmitting}
                    className={fieldErrors.website ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.website && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.website[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Official Contact Person */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Authorized Contact Person
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact_person" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Contact Person Name *
                  </label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    placeholder="e.g. Vikramaditya Roy"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.contact_person ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.contact_person && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.contact_person[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="designation" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Designation *
                  </label>
                  <Input
                    id="designation"
                    name="designation"
                    placeholder="e.g. Head of Talent Acquisition"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.designation ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.designation && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.designation[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="business_email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Business Email *
                  </label>
                  <Input
                    id="business_email"
                    name="business_email"
                    type="email"
                    placeholder="recruiter@company.com"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.business_email ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.business_email && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.business_email[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Mobile / Contact Phone *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98111 22233"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.phone ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Hiring & Collaboration Requirements */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Hiring Needs & Collaboration
                </h2>
              </div>

              {/* Opportunity types */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Types of Opportunities Planned *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OPPORTUNITY_TYPES.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOpportunities.includes(type.id)}
                        onChange={() => toggleOpportunity(type.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
                {fieldErrors.opportunity_types && (
                  <p className="text-xs text-rose-500 mt-1">{fieldErrors.opportunity_types[0]}</p>
                )}
              </div>

              {/* Hiring volume */}
              <div className="mb-6">
                <label htmlFor="hiring_volume" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimated Hiring Volume (Next 6-12 Months)
                </label>
                <Input
                  id="hiring_volume"
                  name="hiring_volume"
                  placeholder="e.g. 10 - 25 graduates / 5 lateral engineers"
                  disabled={isSubmitting}
                />
              </div>

              {/* Hiring Needs Description */}
              <div className="mb-6">
                <label htmlFor="hiring_needs" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Describe Your Hiring Requirements & Roles *
                </label>
                <Textarea
                  id="hiring_needs"
                  name="hiring_needs"
                  rows={4}
                  placeholder="Please outline the job titles, primary technology stacks, minimum qualifications, work modes (remote/hybrid/on-site), and tentative timelines..."
                  required
                  disabled={isSubmitting}
                  className={fieldErrors.hiring_needs ? 'border-rose-500' : ''}
                />
                {fieldErrors.hiring_needs && (
                  <p className="text-xs text-rose-500 mt-1">{fieldErrors.hiring_needs[0]}</p>
                )}
              </div>

              {/* Collaboration Interests */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Modes of Collaboration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLLABORATION_OPTIONS.map((collab) => (
                    <label
                      key={collab.id}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollaborations.includes(collab.id)}
                        onChange={() => toggleCollaboration(collab.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {collab.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Verification Policy & Consent */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 mb-5 leading-relaxed">
                <span className="font-semibold">Notice:</span> By submitting this form, you acknowledge that job postings are not automatically published. An administrator from Akshitha Edutech will contact you to verify employer authenticity and coordinate listings.
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  defaultChecked
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  I represent the listed organization and consent to Akshitha Edutech Private Limited processing our hiring requirements in accordance with the{' '}
                  <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {fieldErrors.consent && (
                <p className="text-xs text-rose-500 mb-4">{fieldErrors.consent[0]}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? 'Submitting Employer Registration...' : 'Submit Employer Registration'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
