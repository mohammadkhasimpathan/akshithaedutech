'use client';

import * as React from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitCareerEnquiry } from '@/app/actions/enquiry-actions';
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await submitCareerEnquiry(formData);

      if (response.success) {
        setIsSuccess(true);
      } else {
        setFormError(response.error || 'Failed to submit enquiry.');
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Enquiry submission failed';
      setFormError(`An unexpected error occurred: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Contact & Career Enquiries
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Have questions regarding placement drives, student advisory, or specific vacancies? Reach out to our career team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Details Card */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Corporate Office
                </h3>

                <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Akshitha Edutech Private Limited
                      <br />
                      Tech Innovation Park, Outer Ring Road,
                      <br />
                      Bengaluru, Karnataka 560100, India
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-cyan-600 shrink-0" />
                    <a href="mailto:careers@akshithaedutech.com" className="hover:text-blue-600">
                      careers@akshithaedutech.com
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>+91 80 4123 4567</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Monday – Friday: 9:30 AM – 6:30 PM IST</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200 space-y-1">
                <strong>Need immediate assistance?</strong>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300">
                  You can also email your application reference ID to our recruitment desk for real-time status updates.
                </p>
              </div>
            </div>

            {/* Career Enquiry Form */}
            <div className="md:col-span-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {isSuccess ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Enquiry Submitted Successfully
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      Thank you for reaching out. Our academic and recruitment advisors will review your enquiry and respond to your email.
                    </p>
                    <div className="pt-2">
                      <Button variant="outline" onClick={() => setIsSuccess(false)}>
                        Send Another Enquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Your Full Name <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          name="name"
                          placeholder="e.g. Arun Kumar"
                          required
                          error={fieldErrors.name?.[0]}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          type="email"
                          name="email"
                          placeholder="arun@example.com"
                          required
                          error={fieldErrors.email?.[0]}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Phone Number (Optional)
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          placeholder="+91 98765 43210"
                          error={fieldErrors.phone?.[0]}
                        />
                      </div>

                      {/* Enquiry Type */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Enquiry Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="enquiry_type"
                          required
                          className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="career_guidance">Career Guidance & Fresher Counseling</option>
                          <option value="job_specific">Inquiry Regarding a Specific Vacancy</option>
                          <option value="general">General Candidate Question</option>
                          <option value="partnership">Corporate Hiring Partnership</option>
                          <option value="other">Other Inquiry</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Message / Query Details <span className="text-rose-500">*</span>
                      </label>
                      <Textarea
                        name="message"
                        rows={4}
                        placeholder="Please describe your question or background in detail (minimum 10 characters)..."
                        required
                        error={fieldErrors.message?.[0]}
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto px-8">
                        Send Career Enquiry
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
