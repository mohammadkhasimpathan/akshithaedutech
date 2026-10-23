// ============================================================================
// Akshitha Edutech Private Limited — Database TypeScript Schema & Types
// Strictly mirrors PostgreSQL migrations in supabase/migrations/
// ============================================================================

export type WorkMode = 'on-site' | 'hybrid' | 'remote';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
export type EnquiryType = 'general' | 'career_guidance' | 'job_specific' | 'partnership' | 'other';
export type EnquiryStatus = 'new' | 'in_progress' | 'resolved';
export type JobReportReason = 'incorrect_info' | 'expired_position' | 'offensive_content' | 'suspected_scam' | 'other';
export type JobReportStatus = 'pending' | 'reviewed' | 'dismissed';
export type AdminRole = 'super_admin' | 'admin' | 'editor';
export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface CompanySettings {
  id: string;
  company_name: string;
  tagline: string | null;
  contact_email: string;
  contact_phone: string | null;
  office_address: string | null;
  social_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    [key: string]: string | undefined;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string; // references auth.users(id)
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  location: string;
  work_mode: WorkMode;
  employment_type: EmploymentType;
  category: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  experience_min: number;
  experience_max: number;
  salary_min: number | null;
  salary_max: number | null;
  skills: string[];
  openings: number;
  application_deadline: string | null;
  application_instructions: string | null;
  status: JobStatus;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  city: string;
  education: string;
  experience_years: number;
  cover_letter: string | null;
  resume_path: string;
  resume_original_name: string;
  consent_at: string;
  status: ApplicationStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  enquiry_type: EnquiryType;
  related_job_id: string | null;
  message: string;
  status: EnquiryStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobReport {
  id: string;
  job_id: string;
  reporter_name: string | null;
  reporter_email: string;
  reason: JobReportReason;
  details: string;
  status: JobReportStatus;
  created_at: string;
  updated_at: string;
}

export interface CareerResource {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: ResourceStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  safe_metadata: Record<string, unknown>;
  created_at: string;
}

export type RegistrationStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface StudentRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  college_name: string;
  course: string;
  specialization: string;
  graduation_year: number;
  skills: string[];
  experience_status: 'fresher' | 'experienced';
  experience_years: number;
  opportunity_interests: string[];
  preferred_locations: string[];
  resume_path: string | null;
  resume_original_name: string | null;
  status: RegistrationStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
}

export interface EmployerRegistration {
  id: string;
  company_name: string;
  contact_person: string;
  business_email: string;
  phone: string;
  designation: string;
  website: string | null;
  industry: string;
  office_location: string;
  hiring_needs: string;
  opportunity_types: string[];
  hiring_volume: string | null;
  collaboration_interests: string[];
  status: RegistrationStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
}

export interface CollegeRegistration {
  id: string;
  institution_name: string;
  institution_type: string;
  official_email: string;
  contact_person: string;
  designation: string;
  phone: string;
  city: string;
  state: string;
  website: string | null;
  courses_departments: string[];
  student_strength: string | null;
  placement_cell_details: string;
  collaboration_interests: string[];
  status: RegistrationStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
}

