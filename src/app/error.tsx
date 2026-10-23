'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error securely
    console.error('Portal application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          We encountered an unexpected issue while loading this page. Please try again.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => reset()} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
