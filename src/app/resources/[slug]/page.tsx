import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MOCK_CAREER_RESOURCES } from '@/lib/data/mock-data';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = MOCK_CAREER_RESOURCES.find((r) => r.slug === slug);

  if (!resource) {
    return { title: 'Resource Not Found | Akshitha Edutech' };
  }

  return {
    title: `${resource.title} | Akshitha Edutech Career Guidance`,
    description: resource.excerpt,
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = MOCK_CAREER_RESOURCES.find((r) => r.slug === slug);

  if (!resource) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Guide Not Found</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              The requested career guide or article is unavailable.
            </p>
            <div className="pt-2">
              <Link href="/resources">
                <Button className="w-full">Browse All Guides</Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 py-10">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all resources
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{resource.category}</Badge>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(resource.published_at || resource.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {resource.title}
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {resource.excerpt}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed space-y-4">
              {resource.content}
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link href="/jobs">
                <Button size="sm">Explore Open Positions</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Contact Career Counselor
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
