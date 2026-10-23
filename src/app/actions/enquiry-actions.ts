'use server';

import { headers } from 'next/headers';
import { publicEnquirySchema } from '@/lib/validations/enquiry';
import { checkRateLimit, verifyHoneypot, verifyPayloadSize } from '@/lib/security/rate-limiter';
import { createAdminClient } from '@/lib/supabase/admin';
import { addMockEnquiry } from '@/lib/data/mock-data';

export interface SubmitEnquiryResponse {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitCareerEnquiry(
  formData: FormData
): Promise<SubmitEnquiryResponse> {
  try {
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    // Verify request payload size limit (max 64 KB for text enquiries)
    const contentLength = parseInt(headerList.get('content-length') || '0', 10);
    if (contentLength > 0 && !verifyPayloadSize(contentLength, 64 * 1024)) {
      return {
        success: false,
        error: 'Request payload exceeds the maximum allowed size (64 KB).',
      };
    }

    const rateCheck = await checkRateLimit(clientIp, 'enquiry');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many enquiries submitted recently. Please wait a few minutes before trying again.',
      };
    }

    const honeypot = formData.get('website_hp') as string | null;
    if (!verifyHoneypot(honeypot)) {
      return {
        success: true,
        message: 'Thank you for contacting us. Your message has been received.',
      };
    }

    const rawData = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || null,
      enquiry_type: formData.get('enquiry_type') || '',
      related_job_id: formData.get('related_job_id') || null,
      message: formData.get('message') || '',
      website_hp: honeypot || '',
    };

    const parsed = publicEnquirySchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString() || 'general';
        fieldErrors[fieldName] = fieldErrors[fieldName] || [];
        fieldErrors[fieldName].push(issue.message);
      });

      return {
        success: false,
        error: 'Please correct the highlighted fields in the enquiry form.',
        fieldErrors,
      };
    }

    const { data: validData } = parsed;

    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';
    if (!isMock) {
      const adminClient = createAdminClient();
      const { error: dbError } = await adminClient.from('enquiries').insert({
        name: validData.name,
        email: validData.email,
        phone: validData.phone,
        enquiry_type: validData.enquiry_type,
        related_job_id: validData.related_job_id,
        message: validData.message,
        status: 'new',
      });

      if (dbError) {
        return {
          success: false,
          error: `Failed to submit enquiry: ${dbError.message}`,
        };
      }
    } else {
      addMockEnquiry({
        id: crypto.randomUUID(),
        name: validData.name,
        email: validData.email,
        phone: validData.phone ?? null,
        enquiry_type: validData.enquiry_type,
        related_job_id: validData.related_job_id ?? null,
        message: validData.message,
        status: 'new',
        internal_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: 'Thank you for reaching out! Our academic and career team will get in touch shortly.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Submission failed';
    return {
      success: false,
      error: `Error: ${msg}`,
    };
  }
}
