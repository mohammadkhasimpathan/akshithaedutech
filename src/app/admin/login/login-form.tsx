'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminLogin } from '@/app/actions/admin-auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set('email', email);
      formData.set('password', password);
      formData.set('redirect', redirectParam);

      const res = await adminLogin(formData);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to authenticate administrator credentials.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setLoading(false);
        return;
      }

      // Successful login -> navigate to validated safe redirect target
      const target = res.redirectTo || '/admin';
      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during login.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-4 shadow-md shadow-blue-500/20">
            AE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Secure Admin Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Akshitha Edutech Private Limited
          </p>
        </div>

        {errorMessage && (
          <div
            id="login-error-alert"
            data-testid="login-error-alert"
            role="alert"
            className="mb-6 p-4 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
          >
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Administrator Email
            </label>
            <Input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@akshithaedutech.com"
              className={fieldErrors.email ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
            </div>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={fieldErrors.password ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
              disabled={loading}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold shadow-md shadow-blue-500/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign In to Admin Portal'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Restricted access. All administrative actions are recorded and audited.</p>
        </div>
      </div>
    </div>
  );
}
