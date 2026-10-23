import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { FileCheck2, Scale, AlertTriangle, ShieldCheck, ArrowRight, Ban, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Akshitha Edutech Private Limited',
  description:
    'Terms of service, platform usage rules, employment disclaimers, and candidate rights for Akshitha Edutech Private Limited job portal.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
              <Scale className="w-3.5 h-3.5" />
              <span>Platform Terms & Service Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Terms & Conditions
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Effective Date: January 1, 2026 • Last Updated: October 2026
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please read these Terms and Conditions (&quot;Terms&quot;) carefully before using the website, job discovery services, student intake features, or institutional collaboration forms operated by Akshitha Edutech Private Limited.
            </p>
          </div>

          {/* Critical Disclaimer Alert */}
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/60 p-6">
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Important Commercial & Employment Disclaimers
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li><strong>No Guarantee of Employment:</strong> Akshitha Edutech Private Limited serves as a career facilitation and talent discovery portal. We do not guarantee employment, interview invitations, or specific salary compensation.</li>
              <li><strong>Zero Candidate Charges:</strong> We never charge applicants or students any fee for browsing jobs, submitting applications, or registering for campus drives. Never pay anyone claiming to represent Akshitha Edutech demanding money for job guarantees.</li>
              <li><strong>Private Commercial Entity:</strong> Akshitha Edutech Private Limited is an incorporated private corporate entity in Bengaluru, India. We are not an organ of government, public employment bureau, or state agency.</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-10 text-slate-700 dark:text-slate-300">
            {/* 1. Acceptance of Terms */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-sm leading-relaxed">
                By accessing or using our job portal, submitting a resume, registering as an employer or college partner, or contacting us through any web form, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must refrain from using the platform.
              </p>
            </section>

            {/* 2. Permitted Use & Candidate Responsibilities */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                2. Candidate & User Responsibilities
              </h2>
              <p className="text-sm leading-relaxed">
                As a candidate or portal visitor, you agree to:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Provide accurate, current, and truthful information regarding your academic background, experience, contact details, and qualifications.</li>
                <li>Submit only valid resumes and documents belonging to you, in PDF format not exceeding 5 MB in file size.</li>
                <li>Refrain from uploading corrupt files, malicious code, or files designed to disrupt server operations.</li>
                <li>Not engage in automated scraping, denial-of-service attempts, or unauthorized access to our administrative interfaces or database infrastructure.</li>
              </ul>
            </section>

            {/* 3. Employer & College Partner Obligations */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                3. Employer & Educational Institution Obligations
              </h2>
              <p className="text-sm leading-relaxed">
                Organizations registering as employers or college placement partners warrant and agree that:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>They are duly registered entities in good legal standing, and the person completing registration has requisite corporate authority.</li>
                <li>All job opportunities and vacancy descriptions represent genuine, bona fide employment or internship positions.</li>
                <li>They will strictly comply with all applicable employment, minimum wage, and non-discrimination laws in India.</li>
                <li>They will never charge applicants any application, training, interview, or registration fee under any pretext.</li>
                <li>Candidate resumes received through Akshitha Edutech Private Limited will be treated confidentially and used solely for lawful hiring evaluation.</li>
              </ul>
            </section>

            {/* 4. Prohibited Conduct */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                4. Strictly Prohibited Conduct
              </h2>
              <p className="text-sm leading-relaxed">
                The following activities are strictly prohibited and will result in immediate blacklisting, removal of listings, and potential referral to cyber law enforcement:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Posting deceptive, multi-level marketing (MLM), or commission-only schemes disguised as salaried employment.</li>
                <li>Posting fraudulent job postings requesting upfront monetary deposits or security fees.</li>
                <li>Submitting false reports, spam enquiries, or manipulated candidate profiles.</li>
                <li>Attempting to bypass row-level security, reverse-engineer administrative credentials, or exploit rate limiters.</li>
              </ul>
            </section>

            {/* 5. Intellectual Property & Portal Rights */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Intellectual Property
              </h2>
              <p className="text-sm leading-relaxed">
                All branding, trademarks, website layout, graphics, text content, design tokens, software code, and career resources published on this portal are the intellectual property of Akshitha Edutech Private Limited or licensed for our use. You may not reproduce, redistribute, or reverse-engineer portal assets without prior written consent.
              </p>
            </section>

            {/* 6. Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                6. Limitation of Liability
              </h2>
              <p className="text-sm leading-relaxed">
                To the maximum extent permitted by applicable Indian law, Akshitha Edutech Private Limited, its directors, officers, and employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Any employment hiring decision, offer revocation, or compensation dispute between candidates and external employers.</li>
                <li>Temporary website downtime, maintenance interruptions, or transmission errors.</li>
                <li>Any conduct or statements made by third-party employers, colleges, or candidates on or off the platform.</li>
              </ul>
            </section>

            {/* 7. Governing Law & Dispute Resolution */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                7. Governing Law & Jurisdiction
              </h2>
              <p className="text-sm leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to these Terms or the use of our services shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
              </p>
            </section>

            {/* 8. Modifications */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                8. Changes to Terms
              </h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to amend or update these Terms at any time. When material changes are made, the updated effective date will be posted at the top of this page. Continued usage of our portal after amendments constitutes your affirmative acceptance of the revised Terms.
              </p>
            </section>

            {/* Grievance Desk */}
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Corporate Governance & Inquiries
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Akshitha Edutech Private Limited</strong><br />
                Tech Innovation Park, Outer Ring Road, Bengaluru, Karnataka 560100, India<br />
                Email: <a href="mailto:careers@akshithaedutech.com" className="text-blue-600 hover:underline">careers@akshithaedutech.com</a><br />
                Grievance Officer: <a href="mailto:legal@akshithaedutech.com" className="text-blue-600 hover:underline">legal@akshithaedutech.com</a><br />
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
              href="/privacy"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              Read Privacy Policy <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
