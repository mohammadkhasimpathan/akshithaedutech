'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitCollegeRegistration } from '@/app/actions/registration-actions';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  School,
} from 'lucide-react';

const INSTITUTION_TYPES = [
  'Engineering & Technology College',
  'University / Deemed University',
  'Polytechnic / Diploma Institute',
  'Management & Business School',
  'Arts, Science & Commerce College',
  'Vocational & Skill Development Institute',
];

const COLLABORATION_OPTIONS = [
  { id: 'campus_placements', label: 'On-Campus & Virtual Recruitment Drives' },
  { id: 'internship_drives', label: 'Summer & Final-Year Internship Sourcing' },
  { id: 'skill_workshops', label: 'Technical Upskilling & Soft-Skill Bootcamps' },
  { id: 'faculty_training', label: 'Faculty Development Programs (FDP)' },
  { id: 'placement_mou', label: 'Institutional Placement Collaboration MOU' },
];

export default function CollegeRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [selectedCollaborations, setSelectedCollaborations] = React.useState<string[]>([
    'campus_placements',
    'internship_drives',
  ]);

  const [result, setResult] = React.useState<{
    success: boolean;
    referenceId?: string;
    message?: string;
  } | null>(null);

  const toggleCollaboration = (id: string) => {
    setSelectedCollaborations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (selectedCollaborations.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        collaboration_interests: ['Please select at least one collaboration interest.'],
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      formData.delete('collaboration_interests');
      selectedCollaborations.forEach((c) => formData.append('collaboration_interests', c));

      const res = await submitCollegeRegistration(formData);

      if (!res.success) {
        setFormError(res.error || 'Failed to submit institution registration.');
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
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Registration Submitted!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
              {result.message}
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                Institution Reference ID
              </span>
              <p className="font-mono font-bold text-lg text-teal-600 dark:text-teal-400 mt-1">
                {result.referenceId}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300 mb-8 text-left leading-relaxed">
              <p className="font-semibold mb-1">Pending Review Workflow:</p>
              Our institutional partnerships cell will review the official contact details and placement cell requirements. A partnership executive will reach out to schedule an introductory alignment call.
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
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-4">
            <School className="w-3.5 h-3.5" />
            <span>Academic & Campus Placement Partnerships</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Register Your Educational Institution
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Empower your students with corporate job opportunities, campus placement drives, industry-aligned internship programs, and corporate skill mentorship through Akshitha Edutech.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Institutional submissions are reviewed by our operations team before verification.</span>
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

            {/* 1. Institution Identity */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Institution Identity
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="institution_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Institution / College Name *
                  </label>
                  <Input
                    id="institution_name"
                    name="institution_name"
                    placeholder="e.g. National Institute of Technology Karnataka"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.institution_name ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.institution_name && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.institution_name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="institution_type" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Institution Category / Type *
                  </label>
                  <select
                    id="institution_type"
                    name="institution_type"
                    required
                    disabled={isSubmitting}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    defaultValue={INSTITUTION_TYPES[0]}
                  >
                    {INSTITUTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="website" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Website URL (Optional)
                  </label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://www.college.edu.in"
                    disabled={isSubmitting}
                    className={fieldErrors.website ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.website && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.website[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    City / District *
                  </label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="e.g. Mangaluru"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.city ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.city && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.city[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    State *
                  </label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="e.g. Karnataka"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.state ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.state && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.state[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Official Contact Person (TPO / Principal) */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Placement Cell / Official Representative
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
                    placeholder="e.g. Dr. Ramesh Kumar"
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
                    placeholder="e.g. Training & Placement Officer / Principal"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.designation ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.designation && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.designation[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="official_email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Institutional Email *
                  </label>
                  <Input
                    id="official_email"
                    name="official_email"
                    type="email"
                    placeholder="placements@college.edu.in"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.official_email ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.official_email && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.official_email[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Contact Phone / Mobile *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 824 2474000"
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

            {/* 3. Placement & Academic Demographics */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Academic Demographics & Collaboration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label htmlFor="courses_departments" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Key Departments / Disciplines
                  </label>
                  <Input
                    id="courses_departments"
                    name="courses_departments"
                    placeholder="e.g. CSE, IT, ECE, Mechanical, MBA"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="student_strength" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Approximate Graduating Batch Size
                  </label>
                  <Input
                    id="student_strength"
                    name="student_strength"
                    placeholder="e.g. 800+ graduating students"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="placement_cell_details" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Placement Cell Overview & Current Objectives *
                </label>
                <Textarea
                  id="placement_cell_details"
                  name="placement_cell_details"
                  rows={4}
                  placeholder="Describe your current placement track record, target companies, key branches seeking placement drives, and schedule preferences..."
                  required
                  disabled={isSubmitting}
                  className={fieldErrors.placement_cell_details ? 'border-rose-500' : ''}
                />
                {fieldErrors.placement_cell_details && (
                  <p className="text-xs text-rose-500 mt-1">{fieldErrors.placement_cell_details[0]}</p>
                )}
              </div>

              {/* Collaboration Interests */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Collaboration Focus Areas *
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
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {collab.label}
                      </span>
                    </label>
                  ))}
                </div>
                {fieldErrors.collaboration_interests && (
                  <p className="text-xs text-rose-500 mt-1">{fieldErrors.collaboration_interests[0]}</p>
                )}
              </div>
            </div>

            {/* 4. Consent and Submission */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  defaultChecked
                  className="mt-1 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  I confirm that I am an authorized representative of the named institution and consent to Akshitha Edutech Private Limited processing these placement details in accordance with the{' '}
                  <Link href="/privacy" className="text-teal-600 dark:text-teal-400 underline hover:text-teal-700">
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
                className="w-full h-12 text-base font-semibold shadow-lg shadow-teal-500/20 bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isSubmitting ? 'Submitting Institution Registration...' : 'Complete College Registration'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
  );
}
