import * as React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentAdminProfile } from '@/lib/auth/admin-auth';
import { AdminLoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Administrator Sign In | Akshitha Edutech',
  description: 'Secure authentication gateway for authorized company administrators.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const currentAdmin = await getCurrentAdminProfile();

  // If already authenticated as an active admin, redirect directly to dashboard
  if (currentAdmin) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <React.Suspense
        fallback={
          <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded mb-6 w-3/4" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
          </div>
        }
      >
        <AdminLoginForm />
      </React.Suspense>
    </div>
  );
}
