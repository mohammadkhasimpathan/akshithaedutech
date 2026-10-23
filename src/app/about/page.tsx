import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Akshitha Edutech Private Limited',
  description:
    'Learn about Akshitha Edutech Private Limited, our mission to bridge academic talent with verified private-sector employment, and our corporate principles.',
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>About Akshitha Edutech Private Limited</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Empowering India&apos;s Private Sector Career Pathways
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              We connect ambitious graduates, entry-level job seekers, and experienced professionals with vetted corporate employers through transparent discovery, campus drives, and direct applications.
            </p>
          </div>

          {/* Core Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Freshers & Early Talent</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Eliminating the entry barrier for recent university graduates through specialized fresher listings (0-1 yrs exp), structured internships, and direct application without registration fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verified Employers</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Providing growing tech, engineering, and service enterprises with verified talent pools, customized campus recruitment drives, and streamlined applicant screening.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Institutional Alliances</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Collaborating with higher education colleges, polytechnics, and universities across India to conduct employability workshops and placement matchmaking.
              </p>
            </div>
          </div>

          {/* Operational Principles */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight">Our Operational Principles</h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                We believe job hunting should be respectful of candidate time and data privacy. We uphold strict operational standards across all portal activities:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">100% Free for Applicants</h3>
                  <p className="text-xs text-slate-300 mt-1">We never charge candidates or students for job discovery, testing, or resume submission.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Zero Account Overhead</h3>
                  <p className="text-xs text-slate-300 mt-1">Candidates apply directly without creating portal accounts or managing unnecessary passwords.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Private Resume Security</h3>
                  <p className="text-xs text-slate-300 mt-1">Uploaded resumes are stored in private cloud storage and accessed via short-lived signed URLs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Verified Private Sector Roles</h3>
                  <p className="text-xs text-slate-300 mt-1">Every listing undergoes administrative verification to prevent deceptive marketing or fees.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Corporate Details */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Corporate Headquarters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-1">Company Legal Entity</span>
                Akshitha Edutech Private Limited<br />
                Incorporated in Bengaluru, Karnataka, India
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-1">Registered Office</span>
                Tech Innovation Park, Outer Ring Road<br />
                Bengaluru, Karnataka 560100
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-1">Communications</span>
                General: careers@akshithaedutech.com<br />
                Institutional: partnerships@akshithaedutech.com
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/jobs">
              <Button size="lg" className="w-full sm:w-auto shadow-md shadow-blue-500/20">
                Explore Open Positions
              </Button>
            </Link>
            <Link href="/register/employer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Partner as an Employer
              </Button>
            </Link>
            <Link href="/register/college">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Register Your College
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
