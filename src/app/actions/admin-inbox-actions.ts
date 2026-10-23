'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { EnquiryStatus, JobReportStatus } from '@/types/database';
import {
  updateMockEnquiry,
  updateMockReport,
} from '@/lib/data/mock-data';
import { createAdminClient } from '@/lib/supabase/admin';

export interface InboxMutationResponse {
  success: boolean;
  error?: string;
}

/**
 * Updates candidate enquiry resolution status and private administrator triage notes.
 */
export async function updateEnquiryStatusAction(
  enquiryId: string,
  status: EnquiryStatus,
  internalNotes?: string | null
): Promise<InboxMutationResponse> {
  try {
    await requireAdminAuth();

    const allowed: EnquiryStatus[] = ['new', 'in_progress', 'resolved'];
    if (!allowed.includes(status)) {
      return { success: false, error: `Invalid enquiry status "${status}".` };
    }

    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const updated = updateMockEnquiry(enquiryId, {
        status,
        internal_notes: internalNotes ?? null,
      });

      if (!updated) {
        return { success: false, error: 'Enquiry not found.' };
      }

      revalidatePath('/admin');
      revalidatePath('/admin/enquiries');
      return { success: true };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('enquiries')
      .update({
        status,
        internal_notes: internalNotes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enquiryId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/enquiries');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update enquiry status.',
    };
  }
}

/**
 * Updates job report status (pending -> reviewed -> dismissed).
 */
export async function updateJobReportStatusAction(
  reportId: string,
  status: JobReportStatus
): Promise<InboxMutationResponse> {
  try {
    await requireAdminAuth();

    const allowed: JobReportStatus[] = ['pending', 'reviewed', 'dismissed'];
    if (!allowed.includes(status)) {
      return { success: false, error: `Invalid report status "${status}".` };
    }

    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const updated = updateMockReport(reportId, { status });
      if (!updated) {
        return { success: false, error: 'Report not found.' };
      }

      revalidatePath('/admin');
      revalidatePath('/admin/reports');
      return { success: true };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('job_reports')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/reports');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update report status.',
    };
  }
}
