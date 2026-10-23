import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JobDetailActions } from '@/components/public/job-detail-actions';
import { getPublishedJobBySlug } from '@/lib/data/jobs';
import { formatCurrencyINR, formatDate } from '@/lib/utils';
import {
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(null, slug);

  if (!job) {
    return {
      title: 'Job Not Found | Akshitha Edutech',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akshithaedutech.com';

  return {
    title: `${job.title} | Akshitha Edutech Careers`,
    description: `Apply for ${job.title} at ${job.company_name} in ${job.location}. Direct application without candidate registration.`,
    alternates: {
      canonical: `${siteUrl}/jobs/${job.slug}`,
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(null, slug);

  // If job doesn't exist or is not published / expired
  if (!job) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Position No Longer Available
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This job posting may have been filled, archived, or expired. Browse our live vacancies to discover other opportunities.
            </p>
            <div className="pt-2">
              <Link href="/jobs">
                <Button className="w-full">Browse Active Jobs</Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isFresher = job.experience_min === 0 && job.experience_max <= 1;

  // Salary calculation
  const hasSalary = job.salary_min !== null || job.salary_max !== null;
  let salaryText = '';
  if (hasSalary) {
    if (job.salary_min && job.salary_max) {
      salaryText = `${formatCurrencyINR(job.salary_min)} – ${formatCurrencyINR(job.salary_max)} per annum`;
    } else if (job.salary_min) {
      salaryText = `Starting from ${formatCurrencyINR(job.salary_min)} per annum`;
    } else if (job.salary_max) {
      salaryText = `Up to ${formatCurrencyINR(job.salary_max)} per annum`;
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akshithaedutech.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.published_at || job.created_at,
    validThrough: job.application_deadline || undefined,
    employmentType: job.employment_type.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      sameAs: siteUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'IN',
      },
    },
    ...(job.salary_min
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary_min,
              maxValue: job.salary_max || job.salary_min,
              unitText: 'YEAR',
            },
          },
        }
      : {}),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Back Link */}
          <div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all opportunities
            </Link>
          </div>

          {/* Job Header Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {job.featured && (
                  <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 gap-1">
                    <Sparkles className="w-3 h-3" /> Featured Role
                  </Badge>
                )}
                {isFresher ? (
                  <Badge variant="success">Freshers Welcome (0-1 yr)</Badge>
                ) : (
                  <Badge variant="default">
                    {job.experience_min}–{job.experience_max} Years Experience
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {job.work_mode}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {job.employment_type}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {job.company_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.category}
                </span>
                {job.openings > 1 && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    {job.openings} Openings
                  </span>
                )}
              </div>

              {/* Salary Section (Strictly displayed only when present) */}
              {hasSalary && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                  <span>Compensation:</span>
                  <span className="text-blue-700 dark:text-blue-300">{salaryText}</span>
                </div>
              )}
            </div>

            {/* Action Bar (Apply Now, Share, Report) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <JobDetailActions job={job} />
            </div>
          </div>

          {/* Job Details Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Role Overview */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  About this Role
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Key Responsibilities
                  </h2>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {job.responsibilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {job.qualifications && job.qualifications.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Qualifications & Eligibility
                  </h2>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {job.qualifications.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Required Skills & Technologies
                  </h2>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-100 dark:border-blue-900"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / Quick Summary */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Application Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Experience Needed</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {isFresher ? '0–1 yr (Freshers)' : `${job.experience_min}–${job.experience_max} yrs`}
                    </span>
                  </div>

                  <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Employment Type</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {job.employment_type}
                    </span>
                  </div>

                  <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Work Mode</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {job.work_mode}
                    </span>
                  </div>

                  {job.application_deadline && (
                    <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Application Deadline</span>
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(job.application_deadline)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Account Requirement</span>
                    <span className="font-semibold text-emerald-600">None (Direct)</span>
                  </div>
                </div>

                {job.application_instructions && (
                  <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <strong>Instructions:</strong> {job.application_instructions}
                  </div>
                )}
              </div>

              {/* Security & Confidentiality Box */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Direct & Private Submission
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your PDF resume and contact details are stored in private storage and reviewed strictly by authorized Akshitha Edutech recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
