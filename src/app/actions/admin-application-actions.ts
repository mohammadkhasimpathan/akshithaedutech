'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { ApplicationStatus } from '@/types/database';
import {
  getMockApplications,
  updateMockApplication,
} from '@/lib/data/mock-data';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSecureResumeDownloadUrl } from '@/lib/data/resumes';

export interface ApplicationMutationResponse {
  success: boolean;
  error?: string;
}

export interface ResumeDownloadUrlResponse {
  success: boolean;
  signedUrl?: string;
  fileName?: string;
  expiresInSeconds?: number;
  error?: string;
}

/**
 * Updates application review status and internal administrative notes.
 * Internal notes are strictly private and NEVER exposed on public candidate interfaces.
 */
export async function updateApplicationReview(
  applicationId: string,
  status: ApplicationStatus,
  internalNotes?: string | null
): Promise<ApplicationMutationResponse> {
  try {
    await requireAdminAuth();

    const allowedStatuses: ApplicationStatus[] = ['pending', 'reviewed', 'shortlisted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return {
        success: false,
        error: `Invalid status "${status}". Allowed values: ${allowedStatuses.join(', ')}`,
      };
    }

    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const updated = updateMockApplication(applicationId, {
        status,
        internal_notes: internalNotes ?? null,
      });

      if (!updated) {
        return { success: false, error: 'Application not found.' };
      }

      revalidatePath('/admin');
      revalidatePath('/admin/applications');
      return { success: true };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('applications')
      .update({
        status,
        internal_notes: internalNotes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/applications');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update application review.',
    };
  }
}

/**
 * Generates an authorized, short-lived signed URL (60s) for viewing or downloading candidate resume.
 *
 * CRITICAL ACCESS CONTROL & TAMPERING PREVENTION:
 * 1. Requires authenticated active administrator session.
 * 2. Fetches application record by ID from database/store to resolve the authentic resume_path.
 * 3. Never accepts arbitrary storage paths from client request parameters.
 * 4. Verifies storage path integrity (must match application and job associations).
 * 5. Uses generateSecureResumeDownloadUrl with 60-second validity window.
 */
export async function getSecureResumeDownloadUrlAction(
  applicationId: string
): Promise<ResumeDownloadUrlResponse> {
  try {
    const admin = await requireAdminAuth();
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const app = getMockApplications().find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: 'Application record not found.' };
      }

      // Verify path starts with resumes/
      if (!app.resume_path || !app.resume_path.startsWith('resumes/')) {
        return { success: false, error: 'Invalid resume storage reference.' };
      }

      // Mock signed URL with token simulating 60-second expiration
      const mockSignedUrl = `/api/admin/resumes/mock-download?applicationId=${encodeURIComponent(
        app.id
      )}&token=${Buffer.from(`${admin.id}:${Date.now() + 60000}`).toString('base64')}`;

      return {
        success: true,
        signedUrl: mockSignedUrl,
        fileName: app.resume_original_name || 'candidate_resume.pdf',
        expiresInSeconds: 60,
      };
    }

    const adminClient = createAdminClient();

    // 1. Fetch application record to verify existence and authentic storage path
    const { data: application, error: appError } = await adminClient
      .from('applications')
      .select('id, job_id, resume_path, resume_original_name')
      .eq('id', applicationId)
      .maybeSingle();

    if (appError || !application) {
      return {
        success: false,
        error: 'Application record not found.',
      };
    }

    // 2. Validate storage path integrity (anti-cross-application tampering)
    const expectedPrefix = `resumes/${application.job_id}/${application.id}/`;
    if (!application.resume_path.startsWith(expectedPrefix)) {
      return {
        success: false,
        error: 'Security alert: Resume storage path does not match application scope.',
      };
    }

    // 3. Delegate to generateSecureResumeDownloadUrl with short 60s expiration
    const result = await generateSecureResumeDownloadUrl(
      adminClient,
      application.resume_path,
      admin.id,
      60
    );

    if (!result.success || !result.signedUrl) {
      return {
        success: false,
        error: result.error || 'Failed to generate signed download URL.',
      };
    }

    return {
      success: true,
      signedUrl: result.signedUrl,
      fileName: application.resume_original_name || 'candidate_resume.pdf',
      expiresInSeconds: 60,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unauthorized resume download request.',
    };
  }
}
