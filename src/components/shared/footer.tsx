import Link from 'next/link';
import { Briefcase, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-sm">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Akshitha Edutech
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
              Akshitha Edutech Private Limited connects fresh graduates and experienced candidates with verified private-sector career opportunities.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Account Hassle • Direct Apply
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Job Seekers
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/jobs" className="hover:text-blue-600 transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?exp=fresher" className="hover:text-blue-600 transition-colors">
                  Freshers Careers (0-1 yrs)
                </Link>
              </li>
              <li>
                <Link href="/jobs?exp=experienced" className="hover:text-blue-600 transition-colors">
                  Experienced Roles (2+ yrs)
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-blue-600 transition-colors">
                  Career Resources & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Registrations & Partnerships */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Registrations & Partnerships
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/register/student" className="hover:text-blue-600 transition-colors font-medium text-blue-600 dark:text-blue-400">
                  Student Registration →
                </Link>
              </li>
              <li>
                <Link href="/register/employer" className="hover:text-indigo-600 transition-colors font-medium text-indigo-600 dark:text-indigo-400">
                  Employer Registration →
                </Link>
              </li>
              <li>
                <Link href="/register/college" className="hover:text-teal-600 transition-colors font-medium text-teal-600 dark:text-teal-400">
                  College Registration →
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Contact & Support
            </h4>
            <ul className="mt-3 space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Tech Innovation Park, Outer Ring Road, Bengaluru, Karnataka 560100</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href="mailto:careers@akshithaedutech.com" className="hover:text-blue-600">
                  careers@akshithaedutech.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+91 80 4123 4567</span>
              </li>
              <li className="pt-1">
                <Link href="/contact" className="text-blue-600 font-medium hover:underline">
                  Career Enquiry Form →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Akshitha Edutech Private Limited. All rights reserved.</p>
          <p className="text-[11px]">
            Private-Sector Employment Portal • English Language Only • Resumes Protected in Private Storage
          </p>
        </div>
      </div>
    </footer>
  );
}
