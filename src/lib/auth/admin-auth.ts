import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminProfile, AdminRole } from '@/types/database';
import { MOCK_ADMIN_PROFILES } from '@/lib/data/mock-data';
import { createClient } from '@/lib/supabase/server';

export const ADMIN_SESSION_COOKIE = 'ae_admin_session';

/**
 * Validates and sanitizes a target redirect URL to strictly prevent open redirects.
 * Only relative internal paths beginning with '/admin' are permitted.
 */
export function sanitizeRedirectPath(rawPath?: string | null): string {
  if (!rawPath || typeof rawPath !== 'string') {
    return '/admin';
  }

  const trimmed = rawPath.trim();

  // Must begin with /admin, cannot begin with // (protocol-relative), backslashes, or include schemes
  if (
    !trimmed.startsWith('/admin') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    trimmed.includes(':')
  ) {
    return '/admin';
  }

  // Prevent URL encoded protocol bypasses (%2f%2f or similar)
  if (/%2f%2f/i.test(trimmed) || /%5c/i.test(trimmed)) {
    return '/admin';
  }

  return trimmed;
}

/**
 * Server-side helper to verify the currently authenticated administrator.
 *
 * CRITICAL SECURITY PRINCIPLES:
 * 1. Checks Supabase Auth session identity server-side.
 * 2. Corroborates user ID against the internal `admin_profiles` table.
 * 3. Asserts `is_active === true`.
 * 4. Never trusts client-supplied user IDs or role assertions.
 */
export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
      if (!sessionCookie?.value) {
        return null;
      }

      const admin = MOCK_ADMIN_PROFILES.find((p) => p.email.toLowerCase() === sessionCookie.value.toLowerCase());
      if (!admin || !admin.is_active) {
        return null;
      }
      return admin;
    } catch {
      return null;
    }
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      return null;
    }

    return profile as AdminProfile;
  } catch {
    return null;
  }
}

/**
 * Strict server-side authorization guard for Server Actions and internal APIs.
 * Throws a descriptive error if the caller is not an active authenticated admin.
 */
export async function requireAdminAuth(allowedRoles?: AdminRole[]): Promise<AdminProfile> {
  const admin = await getCurrentAdminProfile();

  if (!admin) {
    throw new Error('UNAUTHORIZED: Valid active administrator session required');
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(admin.role)) {
    throw new Error('FORBIDDEN: Insufficient administrative privileges');
  }

  return admin;
}

/**
 * Route protection guard for React Server Component admin pages.
 * Redirects unauthenticated or inactive visitors directly to /admin/login with safe redirect parameter.
 */
export async function requireAdminPageSession(currentPath: string = '/admin'): Promise<AdminProfile> {
  const admin = await getCurrentAdminProfile();

  if (!admin) {
    const safeRedirect = encodeURIComponent(sanitizeRedirectPath(currentPath));
    redirect(`/admin/login?redirect=${safeRedirect}`);
  }

  return admin;
}
