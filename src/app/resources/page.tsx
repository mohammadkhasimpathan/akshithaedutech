import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_CAREER_RESOURCES } from '@/lib/data/mock-data';
import { ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Career Guidance & Fresher Prep | Akshitha Edutech',
  description:
    'Practical career preparation guides, interview advice, and technical resume tips for college graduates and lateral career switchers.',
};

export default function ResourcesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Career Advisory & Placement Support
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Career Guidance & Placement Prep
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Expert advice for campus recruits, fresh graduates, and experienced engineers navigating private-sector interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_CAREER_RESOURCES.map((resource) => (
              <Card
                key={resource.id}
                className="p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{resource.category}</Badge>
                    <span className="text-[11px] text-slate-400">
                      {new Date(resource.published_at || resource.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-2">
                    <Link href={`/resources/${resource.slug}`}>{resource.title}</Link>
                  </h2>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {resource.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/resources/${resource.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Read Full Guide <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Need 1-on-1 counseling callout */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Looking for personalized fresher counseling?
              </h3>
              <p className="text-xs text-slate-500">
                Our career counselors conduct dedicated guidance sessions for students and recent graduates.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
            >
              Contact Career Team
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
