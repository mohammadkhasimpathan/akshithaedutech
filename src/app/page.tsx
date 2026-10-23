import Link from 'next/link';
import {
  Briefcase,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Users,
  Search,
  ArrowRight,
  BookOpen,
  Building2,
  Lock,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { JobCard } from '@/components/public/job-card';
import { getPublishedJobs } from '@/lib/data/jobs';
import { MOCK_CAREER_RESOURCES, MOCK_COMPANY_SETTINGS } from '@/lib/data/mock-data';

export default async function HomePage() {
  // Retrieve featured & recent published jobs server-side
  const { jobs: featuredJobs } = await getPublishedJobs(null, { limit: 4 });

  const categories = [
    { title: 'Software & Technology', count: '10+ Openings', icon: Briefcase, query: 'Engineering' },
    { title: 'Student Counseling', count: '4 Openings', icon: GraduationCap, query: 'Student+Advisory' },
    { title: 'Curriculum & Content', count: '6 Openings', icon: BookOpen, query: 'Education+%26+Content' },
    { title: 'Operations & Logistics', count: '3 Openings', icon: Building2, query: 'Operations' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-100 dark:border-slate-800">
          {/* Subtle Ambient Background Gradients */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-[450px] w-[650px] rounded-full bg-gradient-to-tr from-blue-500/10 via-cyan-400/10 to-indigo-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Verified Private-Sector Careers • Zero Account Hassle
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white leading-tight">
              Launch Your Next Career Move with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Akshitha Edutech
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300 leading-relaxed">
              Curated private-sector openings for freshers and experienced professionals.
              No student login or registration required — browse verified roles, apply directly, and upload your PDF resume in seconds.
            </p>

            {/* Quick Keyword Search Form */}
            <div className="mx-auto mt-8 max-w-xl">
              <form action="/jobs" method="GET" className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Job title, skill (e.g. React, Counseling, Operations)..."
                  className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                />
                <Button type="submit" size="md" className="shrink-0">
                  Search Jobs
                </Button>
              </form>
            </div>

            {/* Fresher & Experienced Entry Points */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/jobs?exp=fresher">
                <Button variant="outline" size="md" className="gap-2 rounded-xl border-emerald-300 hover:border-emerald-500 text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  Browse Freshers Jobs (0-1 yrs)
                </Button>
              </Link>

              <Link href="/jobs?exp=experienced">
                <Button variant="outline" size="md" className="gap-2 rounded-xl border-blue-300 hover:border-blue-500 text-blue-800 hover:bg-blue-50 dark:text-blue-300">
                  <Users className="w-4 h-4 text-blue-600" />
                  Experienced Openings (2+ yrs)
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Core Portals & Pathways (Navigation CTA Cards) */}
        <section className="py-12 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Gateways & Stakeholder Workflows
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Choose Your Pathway
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                Direct pathways for job seekers, students, recruiting employers, and educational institutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Find Jobs */}
              <Link href="/jobs" className="group">
                <Card className="p-6 h-full border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      Find Jobs
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Search and apply directly to verified private-sector openings without creating an account.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-blue-600 group-hover:underline">
                    Browse All Listings →
                  </div>
                </Card>
              </Link>

              {/* 2. Student Registration */}
              <Link href="/register/student" className="group">
                <Card className="p-6 h-full border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      Student Registration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Register your profile for career guidance, internships, fresher jobs, and placement drives.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-teal-600 group-hover:underline">
                    Submit Student Profile →
                  </div>
                </Card>
              </Link>

              {/* 3. Employer Registration */}
              <Link href="/register/employer" className="group">
                <Card className="p-6 h-full border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      Employer Registration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Partner with us to announce recruitment needs, hire pre-screened freshers, and host drives.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-indigo-600 group-hover:underline">
                    Register as Employer →
                  </div>
                </Card>
              </Link>

              {/* 4. College Registration */}
              <Link href="/register/college" className="group">
                <Card className="p-6 h-full border border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                      College Registration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Bring campus drives, student upskilling bootcamps, and placement MOUs to your institution.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-cyan-600 group-hover:underline">
                    Partner Your Institution →
                  </div>
                </Card>
              </Link>

              {/* 5. Career Resources */}
              <Link href="/resources" className="group">
                <Card className="p-6 h-full border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      Career Resources
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Free interview preparation guides, resume formats, and private-sector navigation advice.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-amber-600 group-hover:underline">
                    Read Career Articles →
                  </div>
                </Card>
              </Link>

              {/* 6. Contact Us */}
              <Link href="/contact" className="group">
                <Card className="p-6 h-full border border-slate-200 dark:border-slate-800 hover:border-slate-500 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      Contact Us
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Reach our Bengaluru operations team directly for inquiries, support, or partnership questions.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-slate-600 group-hover:underline">
                    Get in Touch →
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Explore by Department
                </h2>
                <p className="text-xs text-slate-500">
                  Opportunities across primary private-sector domains
                </p>
              </div>
              <Link href="/jobs" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.title} href={`/jobs?cat=${cat.query}`}>
                    <Card className="hover:border-blue-400/80 hover:shadow-md transition-all group p-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors dark:bg-blue-950 dark:text-blue-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {cat.title}
                          </h3>
                          <span className="text-xs text-slate-500">{cat.count}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Openings Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  ● Handpicked Openings
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Featured Opportunities
                </h2>
              </div>
              <Link href="/jobs">
                <Button variant="outline" size="sm" className="gap-1.5">
                  View All Openings ({featuredJobs.length})
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {featuredJobs.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl border-slate-300">
                <p className="text-sm text-slate-500">No active job listings currently published.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Akshitha Edutech (Value Proposition) */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="info" className="mb-3">
                Candidate-First Architecture
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Designed for Speed, Privacy & Trust
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                We remove registration obstacles and protect applicant confidentiality with bank-grade security standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">No Account Friction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Students and candidates never need to register, manage passwords, or verify emails just to submit an application.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Private Resume Storage</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your PDF resume is strictly isolated in private object storage. Only verified internal administrators can generate short-lived signed URLs.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Verified Private Sector Roles</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All listings are directly published by Akshitha Edutech and our corporate hiring partners. Every posting is vetted for legitimacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Career Guidance Highlights */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Career Guidance & Placement Prep
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Practical guides for fresh graduates and lateral career switchers
                </p>
              </div>
              <Link href="/resources" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                All Resources <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_CAREER_RESOURCES.slice(0, 2).map((res) => (
                <Card key={res.id} className="hover:border-blue-400 transition-colors p-6">
                  <Badge variant="secondary" className="mb-3">
                    {res.category}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    <Link href={`/resources/${res.slug}`}>{res.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {res.excerpt}
                  </p>
                  <Link
                    href={`/resources/${res.slug}`}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Read Guide <ArrowRight className="w-3 h-3" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Verified Company Information & Trust Section */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Corporate Employer & Education Provider
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {MOCK_COMPANY_SETTINGS.company_name}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {MOCK_COMPANY_SETTINGS.tagline}. We bridge academia and the private sector by connecting motivated freshers and experienced candidates directly with legitimate corporate vacancies without mandatory candidate registration or middleman fees.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{MOCK_COMPANY_SETTINGS.office_address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-cyan-600 shrink-0" />
                      <a href={`mailto:${MOCK_COMPANY_SETTINGS.contact_email}`} className="text-blue-600 hover:underline">
                        {MOCK_COMPANY_SETTINGS.contact_email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{MOCK_COMPANY_SETTINGS.contact_phone}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Strictly 100% Private Sector Positions</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/60 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Candidate Verification Standards
                  </h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>No application or registration fees are ever charged.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Resumes are kept in private storage with no public exposure.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>All vacancies are vetted for legitimacy and compensation clarity.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/contact">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Contact Verification Desk
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
