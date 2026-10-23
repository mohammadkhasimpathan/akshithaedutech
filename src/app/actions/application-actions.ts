'use server';

import crypto from 'crypto';
import { headers } from 'next/headers';
import { publicApplicationSchema } from '@/lib/validations/application';
import { validateResumeBuffer } from '@/lib/security/resume-validator';
import { checkRateLimit, verifyHoneypot } from '@/lib/security/rate-limiter';
import { verifyJobEligibilityForApplication } from '@/lib/data/jobs';
import { createAdminClient } from '@/lib/supabase/admin';
import { addMockApplication } from '@/lib/data/mock-data';

export interface SubmitApplicationResponse {
  success: boolean;
  referenceId?: string;
  candidateName?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// In-memory set for duplicate tracking during offline development and testing
const mockSubmittedApplications = new Set<string>();

export async function clearMockSubmittedApplications(): Promise<void> {
  mockSubmittedApplications.clear();
}

export async function submitCandidateApplication(
  formData: FormData
): Promise<SubmitApplicationResponse> {
  try {
    // 1. Extract client IP from headers for rate limiting
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    // 2. Anti-abuse rate limiting check
    const rateCheck = await checkRateLimit(clientIp, 'application');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many submissions. Please wait an hour before submitting another application.',
      };
    }

    // 3. Honeypot check for automated spam bots
    const honeypot = formData.get('website_hp') as string | null;
    if (!verifyHoneypot(honeypot)) {
      // Silently return success to bot without saving payload
      return {
        success: true,
        referenceId: `REF-${Date.now().toString().slice(-6)}`,
        candidateName: 'Applicant',
      };
    }

    // 4. Parse text fields with publicApplicationSchema
    const rawData = {
      candidate_name: formData.get('candidate_name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      city: formData.get('city') || '',
      education: formData.get('education') || '',
      experience_years: formData.get('experience_years') || 0,
      cover_letter: formData.get('cover_letter') || null,
      job_id: formData.get('job_id') || '',
      consent: formData.get('consent') === 'true' || formData.get('consent') === 'on',
      website_hp: honeypot || '',
    };

    const parsed = publicApplicationSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString() || 'general';
        fieldErrors[fieldName] = fieldErrors[fieldName] || [];
        fieldErrors[fieldName].push(issue.message);
      });

      return {
        success: false,
        error: 'Please correct the highlighted errors in your application.',
        fieldErrors,
      };
    }

    const { data: validData } = parsed;

    // 5. Verify target job exists, is published, and is not expired
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';
    let adminClient = null;
    if (!isMock) {
      try {
        adminClient = createAdminClient();
      } catch {
        return {
          success: false,
          error: 'Database connection is not configured or unavailable.',
        };
      }
    }

    const eligibility = await verifyJobEligibilityForApplication(adminClient, validData.job_id);
    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason || 'This position is currently not accepting applications.',
      };
    }

    // 6. Check for duplicate application (same email applying to the same job_id)
    const submissionKey = `${validData.job_id}:${validData.email.toLowerCase()}`;
    if (mockSubmittedApplications.has(submissionKey)) {
      return {
        success: false,
        error: 'An application with this email address has already been submitted for this position.',
      };
    }

    if (adminClient && !isMock) {
      const { data: existingApp } = await adminClient
        .from('applications')
        .select('id')
        .eq('job_id', validData.job_id)
        .eq('email', validData.email)
        .maybeSingle();

      if (existingApp) {
        return {
          success: false,
          error: 'An application with this email address has already been submitted for this position.',
        };
      }
    }

    // 7. Validate PDF resume file
    const resumeFile = formData.get('resume') as File | null;
    if (!resumeFile || !(resumeFile instanceof File) || resumeFile.size === 0) {
      return {
        success: false,
        error: 'Please upload your resume in PDF format.',
        fieldErrors: { resume: ['Resume PDF file is required'] },
      };
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const applicationId = crypto.randomUUID();

    const pdfValidation = validateResumeBuffer(
      fileBuffer,
      resumeFile.name,
      validData.job_id,
      applicationId
    );

    if (!pdfValidation.success) {
      return {
        success: false,
        error: pdfValidation.error.message,
        fieldErrors: { resume: [pdfValidation.error.message] },
      };
    }

    const validatedResume = pdfValidation.data;

    // 8. Persist to Supabase Storage & Database
    if (adminClient && !isMock) {
      // Upload PDF to private resumes bucket
      const { error: uploadError } = await adminClient.storage
        .from('resumes')
        .upload(validatedResume.storagePath.replace(/^resumes\//, ''), validatedResume.buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        return {
          success: false,
          error: 'Failed to securely store your resume. Please try again.',
        };
      }

      // Insert record into applications table
      const { error: dbError } = await adminClient.from('applications').insert({
        id: applicationId,
        job_id: validData.job_id,
        candidate_name: validData.candidate_name,
        email: validData.email,
        phone: validData.phone,
        city: validData.city,
        education: validData.education,
        experience_years: validData.experience_years,
        cover_letter: validData.cover_letter,
        resume_path: validatedResume.storagePath,
        resume_original_name: validatedResume.sanitizedOriginalName,
        consent_at: new Date().toISOString(),
        status: 'pending',
      });

      if (dbError) {
        // Rollback uploaded resume to prevent orphan storage
        await adminClient.storage
          .from('resumes')
          .remove([validatedResume.storagePath.replace(/^resumes\//, '')]);

        return {
          success: false,
          error: 'An unexpected database error occurred. Please try again.',
        };
      }

      return {
        success: true,
        referenceId: applicationId,
        candidateName: validData.candidate_name,
      };
    }

    // Record submission in mock store only when in mock mode
    mockSubmittedApplications.add(submissionKey);
    addMockApplication({
      id: applicationId,
      job_id: validData.job_id,
      candidate_name: validData.candidate_name,
      email: validData.email,
      phone: validData.phone,
      city: validData.city,
      education: validData.education,
      experience_years: validData.experience_years,
      cover_letter: validData.cover_letter,
      resume_path: validatedResume.storagePath,
      resume_original_name: validatedResume.sanitizedOriginalName,
      consent_at: new Date().toISOString(),
      status: 'pending',
      internal_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      referenceId: applicationId,
      candidateName: validData.candidate_name,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Application submission failed';
    return {
      success: false,
      error: `Application error: ${message}`,
    };
  }
}
