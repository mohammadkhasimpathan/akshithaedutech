'use server';

import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import {
  ADMIN_SESSION_COOKIE,
  getCurrentAdminProfile,
  sanitizeRedirectPath,
} from '@/lib/auth/admin-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { MOCK_ADMIN_PROFILES } from '@/lib/data/mock-data';
import { createClient } from '@/lib/supabase/server';
import { AdminProfile } from '@/types/database';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid administrative email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  redirect: z.string().optional().nullable(),
});

export interface AdminLoginResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  redirectTo?: string;
  admin?: AdminProfile;
}

export interface AdminLogoutResponse {
  success: boolean;
  redirectTo: string;
}

/**
 * Server Action for Administrator Login.
 *
 * CRITICAL DEFENSE-IN-DEPTH:
 * 1. Exclusively accepts credentials for provisioned administrators.
 * 2. Inactive accounts are blocked even if password is correct.
 * 3. Open redirects are strictly prevented via sanitizeRedirectPath.
 * 4. Error messages are deliberately generic to prevent user enumeration.
 * 5. Rate limiting prevents brute force / credential stuffing attacks.
 */
export async function adminLogin(formData: FormData): Promise<AdminLoginResponse> {
  try {
    // 0. Extract client IP and enforce rate limiting against brute force
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rateCheck = await checkRateLimit(clientIp, 'login');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
      };
    }

    const rawData = {
      email: formData.get('email') || '',
      password: formData.get('password') || '',
      redirect: formData.get('redirect') || null,
    };

    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        error: 'Please correct the errors in the login form.',
        fieldErrors,
      };
    }

    const { email, password, redirect } = parsed.data;
    const safeRedirect = sanitizeRedirectPath(redirect);
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const adminCandidate = MOCK_ADMIN_PROFILES.find(
        (p) => p.email.toLowerCase() === email.toLowerCase()
      );

      // Verify mock credentials
      // Default mock admin password: AdminPass123!
      if (!adminCandidate || (password !== 'AdminPass123!' && password !== 'Admin123!')) {
        return {
          success: false,
          error: 'Invalid administrative email or password.',
        };
      }

      if (!adminCandidate.is_active) {
        return {
          success: false,
          error: 'Your administrator account has been deactivated. Please contact the lead administrator.',
        };
      }

      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, adminCandidate.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return {
        success: true,
        redirectTo: safeRedirect,
        admin: adminCandidate,
      };
    }

    // Live Supabase Auth Flow
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: 'Invalid administrative email or password.',
      };
    }

    // Corroborate identity in admin_profiles
    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      // Immediately sign out to revoke any session token
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Access denied: You do not have active administrator permissions.',
      };
    }

    return {
      success: true,
      redirectTo: safeRedirect,
      admin: profile as AdminProfile,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
    return {
      success: false,
      error: `Login failed: ${message}`,
    };
  }
}

/**
 * Server Action to securely sign out the administrator.
 */
export async function adminLogout(): Promise<AdminLogoutResponse> {
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';
  const cookieStore = await cookies();

  if (isMock) {
    cookieStore.delete(ADMIN_SESSION_COOKIE);
  } else {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Safe fallback
    }
    cookieStore.delete(ADMIN_SESSION_COOKIE);
  }

  return {
    success: true,
    redirectTo: '/admin/login',
  };
}

/**
 * Returns current admin profile status (safe for client components).
 */
export async function getAdminSessionAction(): Promise<{
  authenticated: boolean;
  admin: AdminProfile | null;
}> {
  const admin = await getCurrentAdminProfile();
  return {
    authenticated: !!admin,
    admin,
  };
}
