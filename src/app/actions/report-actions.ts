'use server';

import { headers } from 'next/headers';
import { publicJobReportSchema } from '@/lib/validations/job-report';
import { checkRateLimit, verifyHoneypot, verifyPayloadSize } from '@/lib/security/rate-limiter';
import { createAdminClient } from '@/lib/supabase/admin';
import { addMockReport } from '@/lib/data/mock-data';

export interface SubmitReportResponse {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitJobReport(
  payload: Record<string, unknown>
): Promise<SubmitReportResponse> {
  try {
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    // Verify request payload size limit (max 64 KB for reports)
    const contentLength = parseInt(headerList.get('content-length') || '0', 10);
    if (contentLength > 0 && !verifyPayloadSize(contentLength, 64 * 1024)) {
      return {
        success: false,
        error: 'Report payload exceeds the maximum allowed size (64 KB).',
      };
    }

    const rateCheck = await checkRateLimit(clientIp, 'report');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many reports submitted recently. Please try again later.',
      };
    }

    const honeypot = payload.website_hp as string | null | undefined;
    if (!verifyHoneypot(honeypot)) {
      return {
        success: true,
        message: 'Thank you. The listing has been flagged for audit review.',
      };
    }

    const parsed = publicJobReportSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString() || 'general';
        fieldErrors[fieldName] = fieldErrors[fieldName] || [];
        fieldErrors[fieldName].push(issue.message);
      });

      return {
        success: false,
        error: 'Please correct the highlighted fields in the report dialog.',
        fieldErrors,
      };
    }

    const { data: validData } = parsed;

    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';
    if (!isMock) {
      const adminClient = createAdminClient();
      const { error: dbError } = await adminClient.from('job_reports').insert({
        job_id: validData.job_id,
        reporter_name: validData.reporter_name,
        reporter_email: validData.reporter_email,
        reason: validData.reason,
        details: validData.details,
        status: 'pending',
      });

      if (dbError) {
        return {
          success: false,
          error: `Failed to submit report: ${dbError.message}`,
        };
      }
    } else {
      addMockReport({
        id: crypto.randomUUID(),
        job_id: validData.job_id,
        reporter_name: validData.reporter_name ?? null,
        reporter_email: validData.reporter_email,
        reason: validData.reason,
        details: validData.details,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: 'Thank you for reporting this position. Our audit team will review the listing.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Report failed';
    return {
      success: false,
      error: `Error: ${msg}`,
    };
  }
}
