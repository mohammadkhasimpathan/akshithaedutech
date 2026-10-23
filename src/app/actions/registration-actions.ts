'use server';

import crypto from 'crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  studentRegistrationSchema,
  employerRegistrationSchema,
  collegeRegistrationSchema,
} from '@/lib/validations/registration';
import { validateResumeBuffer } from '@/lib/security/resume-validator';
import { checkRateLimit, verifyHoneypot } from '@/lib/security/rate-limiter';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import {
  RegistrationStatus,
  StudentRegistration,
  EmployerRegistration,
  CollegeRegistration,
} from '@/types/database';
import {
  getMockStudentRegistrations,
  addMockStudentRegistration,
  updateMockStudentRegistration,
  getMockEmployerRegistrations,
  addMockEmployerRegistration,
  updateMockEmployerRegistration,
  getMockCollegeRegistrations,
  addMockCollegeRegistration,
  updateMockCollegeRegistration,
} from '@/lib/data/mock-data';

export interface RegistrationActionResponse {
  success: boolean;
  referenceId?: string;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// In-memory sets to prevent duplicate bursts during test/mock runs
const registeredStudentEmails = new Set<string>();
const registeredEmployerEmails = new Set<string>();
const registeredCollegeEmails = new Set<string>();

/**
 * FEATURE A: Student / Fresher Registration Action
 */
export async function submitStudentRegistration(
  formData: FormData
): Promise<RegistrationActionResponse> {
  try {
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rateCheck = await checkRateLimit(clientIp, 'registration');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many registration requests. Please wait a short while before trying again.',
      };
    }

    const honeypot = (formData.get('website_hp') as string | null) || '';
    if (!verifyHoneypot(honeypot)) {
      return {
        success: true,
        referenceId: `STU-${Date.now().toString().slice(-6)}`,
        message: 'Your registration has been submitted successfully.',
      };
    }

    // Parse array/comma values
    const skillsRaw = formData.getAll('skills');
    const skills = skillsRaw.length > 0 ? skillsRaw.map(String) : (formData.get('skills') as string) || '';

    const interestsRaw = formData.getAll('opportunity_interests');
    const opportunity_interests = interestsRaw.length > 0 ? interestsRaw.map(String) : (formData.get('opportunity_interests') as string) || '';

    const locationsRaw = formData.getAll('preferred_locations');
    const preferred_locations = locationsRaw.length > 0 ? locationsRaw.map(String) : (formData.get('preferred_locations') as string) || '';

    const rawData = {
      full_name: formData.get('full_name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      city: formData.get('city') || '',
      state: formData.get('state') || '',
      college_name: formData.get('college_name') || '',
      course: formData.get('course') || '',
      specialization: formData.get('specialization') || '',
      graduation_year: formData.get('graduation_year') || '',
      skills,
      experience_status: formData.get('experience_status') || 'fresher',
      experience_years: formData.get('experience_years') || 0,
      opportunity_interests,
      preferred_locations,
      consent: formData.get('consent') === 'true' || formData.get('consent') === 'on',
      website_hp: honeypot,
    };

    const parsed = studentRegistrationSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString() || 'general';
        fieldErrors[field] = fieldErrors[field] || [];
        fieldErrors[field].push(issue.message);
      });
      return {
        success: false,
        error: 'Please correct the highlighted fields in the form.',
        fieldErrors,
      };
    }

    const validData = parsed.data;
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

    // Duplicate check
    const normalizedEmail = validData.email.toLowerCase();
    if (registeredStudentEmails.has(normalizedEmail)) {
      return {
        success: false,
        error: 'A student registration with this email address has already been submitted.',
      };
    }

    if (adminClient && !isMock) {
      const { data: existing } = await adminClient
        .from('student_registrations')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: 'A student registration with this email address has already been submitted.',
        };
      }
    }

    const registrationId = crypto.randomUUID();
    let resumePath: string | null = null;
    let resumeOriginalName: string | null = null;

    // Optional resume upload
    const resumeFile = formData.get('resume') as File | null;
    if (resumeFile && resumeFile instanceof File && resumeFile.size > 0) {
      const arrayBuffer = await resumeFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const validation = validateResumeBuffer(
        fileBuffer,
        resumeFile.name,
        'student-registrations',
        registrationId
      );

      if (!validation.success) {
        return {
          success: false,
          error: validation.error.message,
          fieldErrors: { resume: [validation.error.message] },
        };
      }

      resumePath = validation.data.storagePath;
      resumeOriginalName = validation.data.sanitizedOriginalName;

      if (adminClient && !isMock) {
        const { error: uploadErr } = await adminClient.storage
          .from('resumes')
          .upload(resumePath.replace(/^resumes\//, ''), validation.data.buffer, {
            contentType: 'application/pdf',
            upsert: false,
          });

        if (uploadErr) {
          return {
            success: false,
            error: 'Failed to securely store your resume. Please try again.',
          };
        }
      }
    }

    if (adminClient && !isMock) {
      const { error: dbError } = await adminClient.from('student_registrations').insert({
        id: registrationId,
        full_name: validData.full_name,
        email: validData.email,
        phone: validData.phone,
        city: validData.city,
        state: validData.state,
        college_name: validData.college_name,
        course: validData.course,
        specialization: validData.specialization,
        graduation_year: validData.graduation_year,
        skills: validData.skills,
        experience_status: validData.experience_status,
        experience_years: validData.experience_years,
        opportunity_interests: validData.opportunity_interests,
        preferred_locations: validData.preferred_locations,
        resume_path: resumePath,
        resume_original_name: resumeOriginalName,
        status: 'pending',
      });

      if (dbError) {
        return {
          success: false,
          error: 'An error occurred while saving your registration. Please try again later.',
        };
      }
    } else {
      registeredStudentEmails.add(normalizedEmail);
      addMockStudentRegistration({
        id: registrationId,
        full_name: validData.full_name,
        email: validData.email,
        phone: validData.phone,
        city: validData.city,
        state: validData.state,
        college_name: validData.college_name,
        course: validData.course,
        specialization: validData.specialization,
        graduation_year: validData.graduation_year,
        skills: validData.skills,
        experience_status: validData.experience_status,
        experience_years: validData.experience_years,
        opportunity_interests: validData.opportunity_interests,
        preferred_locations: validData.preferred_locations,
        resume_path: resumePath,
        resume_original_name: resumeOriginalName,
        status: 'pending',
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        consent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      referenceId: registrationId,
      message: 'Registration submitted successfully! Our career team will review your profile.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

/**
 * FEATURE B: Employer Registration Action
 */
export async function submitEmployerRegistration(
  formData: FormData
): Promise<RegistrationActionResponse> {
  try {
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rateCheck = await checkRateLimit(clientIp, 'registration');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many registration requests. Please wait a short while before trying again.',
      };
    }

    const honeypot = (formData.get('website_hp') as string | null) || '';
    if (!verifyHoneypot(honeypot)) {
      return {
        success: true,
        referenceId: `EMP-${Date.now().toString().slice(-6)}`,
        message: 'Your employer registration has been submitted for administrative review.',
      };
    }

    const opportunityTypesRaw = formData.getAll('opportunity_types');
    const opportunity_types =
      opportunityTypesRaw.length > 0
        ? opportunityTypesRaw.map(String)
        : (formData.get('opportunity_types') as string) || '';

    const collaborationInterestsRaw = formData.getAll('collaboration_interests');
    const collaboration_interests =
      collaborationInterestsRaw.length > 0
        ? collaborationInterestsRaw.map(String)
        : (formData.get('collaboration_interests') as string) || '';

    const rawData = {
      company_name: formData.get('company_name') || '',
      contact_person: formData.get('contact_person') || '',
      business_email: formData.get('business_email') || '',
      phone: formData.get('phone') || '',
      designation: formData.get('designation') || '',
      website: formData.get('website') || '',
      industry: formData.get('industry') || '',
      office_location: formData.get('office_location') || '',
      hiring_needs: formData.get('hiring_needs') || '',
      opportunity_types,
      hiring_volume: formData.get('hiring_volume') || null,
      collaboration_interests,
      consent: formData.get('consent') === 'true' || formData.get('consent') === 'on',
      website_hp: honeypot,
    };

    const parsed = employerRegistrationSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString() || 'general';
        fieldErrors[field] = fieldErrors[field] || [];
        fieldErrors[field].push(issue.message);
      });
      return {
        success: false,
        error: 'Please correct the highlighted fields in the employer form.',
        fieldErrors,
      };
    }

    const validData = parsed.data;
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

    const normalizedEmail = validData.business_email.toLowerCase();
    if (registeredEmployerEmails.has(normalizedEmail)) {
      return {
        success: false,
        error: 'An employer registration with this business email has already been submitted.',
      };
    }

    if (adminClient && !isMock) {
      const { data: existing } = await adminClient
        .from('employer_registrations')
        .select('id')
        .eq('business_email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: 'An employer registration with this business email has already been submitted.',
        };
      }
    }

    const registrationId = crypto.randomUUID();

    if (adminClient && !isMock) {
      const { error: dbError } = await adminClient.from('employer_registrations').insert({
        id: registrationId,
        company_name: validData.company_name,
        contact_person: validData.contact_person,
        business_email: validData.business_email,
        phone: validData.phone,
        designation: validData.designation,
        website: validData.website,
        industry: validData.industry,
        office_location: validData.office_location,
        hiring_needs: validData.hiring_needs,
        opportunity_types: validData.opportunity_types,
        hiring_volume: validData.hiring_volume,
        collaboration_interests: validData.collaboration_interests,
        status: 'pending',
      });

      if (dbError) {
        return {
          success: false,
          error: 'Failed to record employer registration. Please try again.',
        };
      }
    } else {
      registeredEmployerEmails.add(normalizedEmail);
      addMockEmployerRegistration({
        id: registrationId,
        company_name: validData.company_name,
        contact_person: validData.contact_person,
        business_email: validData.business_email,
        phone: validData.phone,
        designation: validData.designation,
        website: validData.website,
        industry: validData.industry,
        office_location: validData.office_location,
        hiring_needs: validData.hiring_needs,
        opportunity_types: validData.opportunity_types,
        hiring_volume: validData.hiring_volume,
        collaboration_interests: validData.collaboration_interests,
        status: 'pending',
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        consent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      referenceId: registrationId,
      message: 'Employer registration received! Our partnerships team will review and connect with you shortly.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

/**
 * FEATURE C: College / Institution Registration Action
 */
export async function submitCollegeRegistration(
  formData: FormData
): Promise<RegistrationActionResponse> {
  try {
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rateCheck = await checkRateLimit(clientIp, 'registration');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many registration requests. Please wait a short while before trying again.',
      };
    }

    const honeypot = (formData.get('website_hp') as string | null) || '';
    if (!verifyHoneypot(honeypot)) {
      return {
        success: true,
        referenceId: `COL-${Date.now().toString().slice(-6)}`,
        message: 'Your institution registration has been submitted for administrative review.',
      };
    }

    const coursesRaw = formData.getAll('courses_departments');
    const courses_departments =
      coursesRaw.length > 0 ? coursesRaw.map(String) : (formData.get('courses_departments') as string) || '';

    const collaborationInterestsRaw = formData.getAll('collaboration_interests');
    const collaboration_interests =
      collaborationInterestsRaw.length > 0
        ? collaborationInterestsRaw.map(String)
        : (formData.get('collaboration_interests') as string) || '';

    const rawData = {
      institution_name: formData.get('institution_name') || '',
      institution_type: formData.get('institution_type') || '',
      official_email: formData.get('official_email') || '',
      contact_person: formData.get('contact_person') || '',
      designation: formData.get('designation') || '',
      phone: formData.get('phone') || '',
      city: formData.get('city') || '',
      state: formData.get('state') || '',
      website: formData.get('website') || '',
      courses_departments,
      student_strength: formData.get('student_strength') || null,
      placement_cell_details: formData.get('placement_cell_details') || '',
      collaboration_interests,
      consent: formData.get('consent') === 'true' || formData.get('consent') === 'on',
      website_hp: honeypot,
    };

    const parsed = collegeRegistrationSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString() || 'general';
        fieldErrors[field] = fieldErrors[field] || [];
        fieldErrors[field].push(issue.message);
      });
      return {
        success: false,
        error: 'Please correct the highlighted fields in the institution form.',
        fieldErrors,
      };
    }

    const validData = parsed.data;
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

    const normalizedEmail = validData.official_email.toLowerCase();
    if (registeredCollegeEmails.has(normalizedEmail)) {
      return {
        success: false,
        error: 'An institution registration with this official email has already been submitted.',
      };
    }

    if (adminClient && !isMock) {
      const { data: existing } = await adminClient
        .from('college_registrations')
        .select('id')
        .eq('official_email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: 'An institution registration with this official email has already been submitted.',
        };
      }
    }

    const registrationId = crypto.randomUUID();

    if (adminClient && !isMock) {
      const { error: dbError } = await adminClient.from('college_registrations').insert({
        id: registrationId,
        institution_name: validData.institution_name,
        institution_type: validData.institution_type,
        official_email: validData.official_email,
        contact_person: validData.contact_person,
        designation: validData.designation,
        phone: validData.phone,
        city: validData.city,
        state: validData.state,
        website: validData.website,
        courses_departments: validData.courses_departments,
        student_strength: validData.student_strength,
        placement_cell_details: validData.placement_cell_details,
        collaboration_interests: validData.collaboration_interests,
        status: 'pending',
      });

      if (dbError) {
        return {
          success: false,
          error: 'Failed to record institution registration. Please try again.',
        };
      }
    } else {
      registeredCollegeEmails.add(normalizedEmail);
      addMockCollegeRegistration({
        id: registrationId,
        institution_name: validData.institution_name,
        institution_type: validData.institution_type,
        official_email: validData.official_email,
        contact_person: validData.contact_person,
        designation: validData.designation,
        phone: validData.phone,
        city: validData.city,
        state: validData.state,
        website: validData.website,
        courses_departments: validData.courses_departments,
        student_strength: validData.student_strength,
        placement_cell_details: validData.placement_cell_details,
        collaboration_interests: validData.collaboration_interests,
        status: 'pending',
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        consent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      referenceId: registrationId,
      message: 'Institution registration received! Our campus placements team will get in touch.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

/**
 * ADMIN REVIEW ACTIONS — Strictly Protected with requireAdminAuth()
 */

export async function updateStudentRegistrationReview(
  id: string,
  status: RegistrationStatus,
  adminNotes?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdminAuth();
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      updateMockStudentRegistration(id, {
        status,
        admin_notes: adminNotes ?? null,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      });
    } else {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('student_registrations')
        .update({
          status,
          admin_notes: adminNotes ?? null,
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    }

    revalidatePath('/admin/registrations');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update student registration status.',
    };
  }
}

export async function updateEmployerRegistrationReview(
  id: string,
  status: RegistrationStatus,
  adminNotes?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdminAuth();
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      updateMockEmployerRegistration(id, {
        status,
        admin_notes: adminNotes ?? null,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      });
    } else {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('employer_registrations')
        .update({
          status,
          admin_notes: adminNotes ?? null,
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    }

    revalidatePath('/admin/registrations');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update employer registration status.',
    };
  }
}

export async function updateCollegeRegistrationReview(
  id: string,
  status: RegistrationStatus,
  adminNotes?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdminAuth();
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      updateMockCollegeRegistration(id, {
        status,
        admin_notes: adminNotes ?? null,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      });
    } else {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('college_registrations')
        .update({
          status,
          admin_notes: adminNotes ?? null,
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    }

    revalidatePath('/admin/registrations');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update college registration status.',
    };
  }
}

export async function getStudentRegistrationsAdmin(): Promise<StudentRegistration[]> {
  await requireAdminAuth();
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    return getMockStudentRegistrations();
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('student_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEmployerRegistrationsAdmin(): Promise<EmployerRegistration[]> {
  await requireAdminAuth();
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    return getMockEmployerRegistrations();
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('employer_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCollegeRegistrationsAdmin(): Promise<CollegeRegistration[]> {
  await requireAdminAuth();
  const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

  if (isMock) {
    return getMockCollegeRegistrations();
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('college_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSecureStudentResumeDownloadUrlAction(
  studentId: string
): Promise<{ success: boolean; signedUrl?: string; fileName?: string; error?: string }> {
  try {
    await requireAdminAuth();
    const isMock = process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCKS === 'true';

    if (isMock) {
      const student = getMockStudentRegistrations().find((s) => s.id === studentId);
      if (!student || !student.resume_path) {
        return { success: false, error: 'Resume file not found for this student.' };
      }

      return {
        success: true,
        signedUrl: `/api/admin/resumes/mock-download?studentId=${encodeURIComponent(student.id)}`,
        fileName: student.resume_original_name || 'student-resume.pdf',
      };
    }

    const adminClient = createAdminClient();
    const { data: student, error: fetchErr } = await adminClient
      .from('student_registrations')
      .select('id, resume_path, resume_original_name')
      .eq('id', studentId)
      .maybeSingle();

    if (fetchErr || !student || !student.resume_path) {
      return { success: false, error: 'Resume file record not found.' };
    }

    const cleanPath = student.resume_path.replace(/^resumes\//, '');
    const { data: signedData, error: signErr } = await adminClient.storage
      .from('resumes')
      .createSignedUrl(cleanPath, 60);

    if (signErr || !signedData?.signedUrl) {
      return { success: false, error: 'Failed to generate secure resume download link.' };
    }

    return {
      success: true,
      signedUrl: signedData.signedUrl,
      fileName: student.resume_original_name || 'student-resume.pdf',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to authorize resume access.',
    };
  }
}
