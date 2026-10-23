import * as React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  GraduationCap,
  Building2,
  School,
  ArrowRight,
  Clock,
} from 'lucide-react';

const CURRENT_YEAR = 2026;

export function Footer() {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="border-t border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
    >
      <h2 id="footer-heading" className="sr-only">
        Website Footer
      </h2>

      {/* Top Collaboration Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900/60 dark:via-blue-950/20 dark:to-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Institutional & Corporate Collaboration
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Partner with Akshitha Edutech Private Limited
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Whether you represent a college placement cell seeking campus drives, an employer sourcing verified professionals, or a candidate launching your career, connect with our team.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/register/employer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hire Talent (Employer)</span>
              </Link>
              <Link
                href="/register/college"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors shadow-sm"
              >
                <School className="w-3.5 h-3.5" />
                <span>Campus Drives (College)</span>
              </Link>
              <Link
                href="/register/student"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Intake</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Organization Identity & Overview (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block">
                  Akshitha Edutech
                </span>
                <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 block -mt-1 tracking-wider uppercase">
                  Private Limited
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated private-sector employment and career discovery platform connecting fresh university graduates and experienced professionals with vetted corporate opportunities across India.
            </p>

            <div className="space-y-2 pt-1">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Free For Applicants • Zero Account Friction</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct job applications with private cloud resume storage. No password overhead, no mandatory accounts, and no candidate placement fees.
              </p>
            </div>
          </div>

          {/* Column 2: Important Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Important Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/jobs"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Browse Open Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?exp=fresher"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Fresher Roles (0-1 yrs)
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?exp=experienced"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Experienced Roles (2+ yrs)
                </Link>
              </li>
              <li>
                <Link
                  href="/register/student"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Student Registration <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/register/employer"
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Employer Registration <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/register/college"
                  className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  College Registration <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Career Resources & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Useful Links & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Useful Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?topic=report"
                  className="text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus:underline"
                >
                  Report an Issue / Job Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Corporate Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Registered Office
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Tech Innovation Park, Outer Ring Road, Bengaluru, Karnataka 560100
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <a
                  href="mailto:careers@akshithaedutech.com"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
                >
                  careers@akshithaedutech.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <a
                  href="tel:+918041234567"
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
                >
                  +91 80 4123 4567
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-500 dark:text-slate-400 pt-1">
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                <span>Mon – Fri, 9:30 AM – 6:30 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Restrained Copyright Strip */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="text-center md:text-left space-y-1">
            <p>
              © {CURRENT_YEAR} <strong>Akshitha Edutech Private Limited</strong>. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Private Corporate Employment Facilitation • Candidate Resumes Protected in Encrypted Cloud Storage
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link
              href="/privacy"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/terms"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
            >
              Terms & Conditions
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/about"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
            >
              About Company
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/contact"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
