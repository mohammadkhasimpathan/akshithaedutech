import { SupabaseClient } from '@supabase/supabase-js';

export interface SignedUrlResult {
  success: boolean;
  signedUrl?: string;
  expiresInSeconds?: number;
  error?: string;
}

/**
 * Generates an authorized, short-lived signed URL for a private candidate resume.
 *
 * CRITICAL APPLICATION SECURITY ENFORCEMENT:
 * 1. Storage paths or client-supplied IDs are NEVER trusted as proof of authorization.
 * 2. The adminUserId is strictly validated against `admin_profiles` to confirm an active administrative role.
 * 3. Short expiry (default 60 seconds) minimizes exposure windows.
 */
export async function generateSecureResumeDownloadUrl(
  adminClient: SupabaseClient,
  resumePath: string,
  adminUserId: string,
  expiresInSeconds: number = 60
): Promise<SignedUrlResult> {
  // 1. Validate inputs
  if (!resumePath || !resumePath.startsWith('resumes/')) {
    return {
      success: false,
      error: 'Invalid resume storage path reference.',
    };
  }

  if (!adminUserId) {
    return {
      success: false,
      error: 'Authentication required to access candidate documents.',
    };
  }

  // 2. Authorize requester identity against internal admin_profiles
  const { data: profile, error: authError } = await adminClient
    .from('admin_profiles')
    .select('id, role, is_active')
    .eq('id', adminUserId)
    .maybeSingle();

  if (authError || !profile || !profile.is_active) {
    return {
      success: false,
      error: 'Access denied: The requesting user is not an active administrator.',
    };
  }

  const authorizedRoles = ['super_admin', 'admin', 'editor'];
  if (!authorizedRoles.includes(profile.role)) {
    return {
      success: false,
      error: 'Access denied: Insufficient administrative privileges.',
    };
  }

  // 3. Extract the object path relative to the 'resumes' bucket
  // Path format: resumes/<jobId>/<applicationId>/<file>.pdf
  const objectKey = resumePath.replace(/^resumes\//, '');

  // 4. Generate short-lived signed URL from private storage bucket
  const { data, error: storageError } = await adminClient.storage
    .from('resumes')
    .createSignedUrl(objectKey, expiresInSeconds);

  if (storageError || !data?.signedUrl) {
    return {
      success: false,
      error: `Failed to generate download URL: ${storageError?.message || 'Unknown storage error'}`,
    };
  }

  return {
    success: true,
    signedUrl: data.signedUrl,
    expiresInSeconds,
  };
}
