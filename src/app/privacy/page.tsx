import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Akshitha Edutech Private Limited',
  description:
    'Comprehensive and truthful privacy disclosure regarding candidate data, student intake, employer registrations, college partnerships, and resume storage.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data Protection & Privacy Transparency</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Privacy Policy
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Effective Date: January 1, 2026 • Last Updated: October 2026
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Akshitha Edutech Private Limited (&quot;we&quot;, &quot;our&quot;, or &quot;Company&quot;) operates the job facilitation and talent intake portal at akshithaedutech.com. This Privacy Policy details how we collect, process, safeguard, and retain information submitted by job candidates, students, employers, and educational institutions.
            </p>
          </div>

          {/* Quick Notice Card */}
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60 p-6">
            <h2 className="text-base font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Zero Account Hassle & Direct Application Privacy Principles
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li><strong>No Passwords or Candidate Accounts:</strong> We do not require job applicants or students to create accounts, set passwords, or share sensitive credentials.</li>
              <li><strong>Private Resume Storage:</strong> Resumes uploaded during job application or student registration are stored in restricted private cloud storage buckets protected by database row-level security and temporary signed URLs.</li>
              <li><strong>No Third-Party Ad Selling:</strong> We do not sell your personal contact information to ad networks, loan brokers, or telemarketers.</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {/* 1. Information Collected */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                1. Information We Collect
              </h2>
              <p className="text-sm leading-relaxed">
                We only collect information voluntarily submitted through our verified portal web forms:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Job Applications</h3>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    <li>Full Name, Email Address, and Phone Number</li>
                    <li>Current City & State of Residence</li>
                    <li>Total Years of Professional Experience</li>
                    <li>LinkedIn profile URL and Portfolio / GitHub URL (optional)</li>
                    <li>Cover Note and Resume (PDF format, maximum 5 MB)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Student & Graduate Intake</h3>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    <li>Full Name, Email, and WhatsApp / Phone Number</li>
                    <li>College / University Name & Degree / Specialization</li>
                    <li>Expected or Completed Graduation Year</li>
                    <li>Technical & Professional Skills and Opportunity Preferences</li>
                    <li>Optional Resume PDF (maximum 5 MB)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Employer Registrations</h3>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    <li>Organization Legal Name & Corporate Website</li>
                    <li>Authorized Contact Person Name, Work Email, and Phone</li>
                    <li>Company Size, Hiring Domains, and Target Roles</li>
                    <li>Collaboration interest (campus, lateral, custom drives)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">College & Institution Inquiries</h3>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    <li>Institution Legal Name, District, and State</li>
                    <li>Authorized TPO / Placement Head Name, Official Email, Phone</li>
                    <li>Student Strength, Degree Programs, and Placement Calendar</li>
                    <li>Institutional Partnership Requirements</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. How Data Is Used */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                2. How We Use Collected Data
              </h2>
              <p className="text-sm leading-relaxed">
                We use information submitted by candidates, students, employers, and academic institutions strictly for legitimate educational, staffing, and career facilitation objectives:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Evaluating candidate eligibility against published job descriptions.</li>
                <li>Forwarding shortlisted candidate resumes directly to the hiring managers of verified employer partners for active interview scheduling.</li>
                <li>Organizing campus placement recruitment drives and technical readiness workshops for registered colleges and their students.</li>
                <li>Communicating application updates, interview schedules, and relevant opening alerts via email or phone.</li>
                <li>Investigating reported fraudulent listings or spam submissions through our job reporting mechanism.</li>
              </ul>
            </section>

            {/* 3. Resume and Storage Security */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-600" />
                3. Technical Data Security & Storage Controls
              </h2>
              <p className="text-sm leading-relaxed">
                Akshitha Edutech Private Limited enforces robust defense-in-depth technical security controls:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li><strong>Private Storage:</strong> Candidate resume files are uploaded to private, non-public cloud object storage buckets. Public direct HTTP access is disabled.</li>
                <li><strong>Application-Scoped Signed URLs:</strong> Authorized administrators and hiring reviewers access resumes exclusively via cryptographically signed URLs that expire within 60 seconds.</li>
                <li><strong>PostgreSQL Row-Level Security (RLS):</strong> Our database implements strict Row-Level Security policies. Anonymous database users have zero SELECT access to applications, resumes, candidate phone numbers, or registration submissions.</li>
                <li><strong>Encryption in Transit & at Rest:</strong> All web traffic is strictly encrypted over TLS 1.3/HTTPS. Stored assets and database volumes are encrypted at rest with industry-standard AES-256.</li>
                <li><strong>Rate Limiting & Abuse Prevention:</strong> Sensitive submission endpoints and admin authentication routes are protected by rate limiters and payload validation checks to safeguard portal availability.</li>
              </ul>
            </section>

            {/* 4. Data Sharing & Third Parties */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                4. Data Sharing & Disclosure
              </h2>
              <p className="text-sm leading-relaxed">
                We never sell, rent, or trade your personally identifiable information. We disclose data solely under the following circumstances:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li><strong>Prospective Hiring Employers:</strong> When you submit a job application, your profile and resume are made accessible to authorized HR teams of that verified employer.</li>
                <li><strong>Cloud Infrastructure Providers:</strong> Managed database and storage infrastructure providers (Supabase / AWS) that operate under strict enterprise data processing and confidentiality agreements.</li>
                <li><strong>Legal Compliance:</strong> If mandated by applicable Indian law, court order, or competent law enforcement authority in connection with legal proceedings or fraud investigation.</li>
              </ul>
            </section>

            {/* 5. Data Retention & Candidate Rights */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                5. Data Retention & Your Rights
              </h2>
              <p className="text-sm leading-relaxed">
                Candidate and registration records are retained for the duration of the relevant hiring cycle and subsequent talent matching for up to 24 months, after which inactive candidate files may be archived or securely deleted.
              </p>
              <p className="text-sm leading-relaxed">
                You possess the following rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li><strong>Right of Access & Correction:</strong> Request a summary or correction of any inaccurate contact or academic information on file.</li>
                <li><strong>Right of Erasure:</strong> Request the deletion of your application record and uploaded resume from our storage.</li>
                <li><strong>Right to Withdraw Consent:</strong> Opt out of future talent matchmaking communications at any time.</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">
                To exercise any of these rights, email our data protection desk at{' '}
                <a href="mailto:privacy@akshithaedutech.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  privacy@akshithaedutech.com
                </a>{' '}
                or reach out through our{' '}
                <Link href="/contact" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Contact Form
                </Link>
                . We respond to all verified privacy requests within 10 business days.
              </p>
            </section>

            {/* 6. Corporate Contact */}
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Company Information & Grievance Contact
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Akshitha Edutech Private Limited</strong><br />
                Tech Innovation Park, Outer Ring Road, Bengaluru, Karnataka 560100, India<br />
                Email: <a href="mailto:privacy@akshithaedutech.com" className="text-blue-600 hover:underline">privacy@akshithaedutech.com</a><br />
                Official Inquiries: <a href="mailto:careers@akshithaedutech.com" className="text-blue-600 hover:underline">careers@akshithaedutech.com</a><br />
                Phone: +91 80 4123 4567
              </p>
            </section>
          </div>

          {/* Bottom Back Button */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
            >
              ← Return to Home
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              Read Terms & Conditions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
