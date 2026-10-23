import * as React from 'react';
import { Metadata } from 'next';
import { requireAdminPageSession } from '@/lib/auth/admin-auth';
import { AdminNav } from '@/components/admin/admin-nav';

export const metadata: Metadata = {
  title: 'Admin Portal | Akshitha Edutech Private Limited',
  description: 'Enterprise administration dashboard and applicant tracking portal.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side active admin authentication on every page
  const admin = await requireAdminPageSession('/admin');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <AdminNav admin={admin} />
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
