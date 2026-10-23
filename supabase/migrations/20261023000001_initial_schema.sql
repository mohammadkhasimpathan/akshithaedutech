-- ============================================================================
-- Akshitha Edutech Private Limited — Job Portal Database Schema
-- Migration: 20261023000001_initial_schema.sql
-- Description: Core tables, constraints, foreign keys, and indexes.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Helper Function: Automatic updated_at timestamp trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Table: company_settings
-- Global portal settings, contact information, and public social presence.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Akshitha Edutech Private Limited',
  tagline TEXT DEFAULT 'Connecting Aspirants with Private Sector Career Opportunities',
  contact_email TEXT NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone TEXT,
  office_address TEXT,
  social_links JSONB NOT NULL DEFAULT '{"linkedin": "", "twitter": "", "facebook": ""}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Table: admin_profiles
-- Internal administrators provisioned through Supabase Auth.
-- Strictly internal; candidates and employers must NEVER have records here.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Table: jobs
-- Core job listings for freshers and experienced candidates.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title TEXT NOT NULL CHECK (length(trim(title)) >= 3),
  company_name TEXT NOT NULL DEFAULT 'Akshitha Edutech Private Limited',
  location TEXT NOT NULL,
  work_mode TEXT NOT NULL CHECK (work_mode IN ('on-site', 'hybrid', 'remote')),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  category TEXT NOT NULL CHECK (length(trim(category)) >= 2),
  description TEXT NOT NULL CHECK (length(trim(description)) >= 20),
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  experience_min INTEGER NOT NULL DEFAULT 0 CHECK (experience_min >= 0),
  experience_max INTEGER NOT NULL DEFAULT 0 CHECK (experience_max >= experience_min),
  salary_min NUMERIC(12, 2) CHECK (salary_min IS NULL OR salary_min >= 0),
  salary_max NUMERIC(12, 2) CHECK (salary_max IS NULL OR salary_max >= salary_min),
  skills TEXT[] NOT NULL DEFAULT '{}',
  openings INTEGER NOT NULL DEFAULT 1 CHECK (openings >= 1),
  application_deadline TIMESTAMPTZ,
  application_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Table: applications
-- Direct candidate submissions with resume metadata.
-- Note: ON DELETE RESTRICT ensures job history and applications are never accidentally lost.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
  candidate_name TEXT NOT NULL CHECK (length(trim(candidate_name)) >= 2),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT NOT NULL CHECK (length(trim(phone)) >= 7),
  city TEXT NOT NULL CHECK (length(trim(city)) >= 2),
  education TEXT NOT NULL CHECK (length(trim(education)) >= 2),
  experience_years NUMERIC(4, 1) NOT NULL DEFAULT 0.0 CHECK (experience_years >= 0.0),
  cover_letter TEXT,
  resume_path TEXT NOT NULL,
  resume_original_name TEXT NOT NULL,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Table: enquiries
-- Career enquiries, general queries, and candidate contact forms.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT,
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('general', 'career_guidance', 'job_specific', 'partnership', 'other')),
  related_job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  message TEXT NOT NULL CHECK (length(trim(message)) >= 10),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Table: job_reports
-- Flagged job notices reported by public visitors (fraud prevention, expired info).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
  reporter_name TEXT,
  reporter_email TEXT NOT NULL CHECK (reporter_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  reason TEXT NOT NULL CHECK (reason IN ('incorrect_info', 'expired_position', 'offensive_content', 'suspected_scam', 'other')),
  details TEXT NOT NULL CHECK (length(trim(details)) >= 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_job_reports_updated_at
  BEFORE UPDATE ON public.job_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. Table: career_resources
-- Public career advice, interview tips, and fresher preparation guides.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title TEXT NOT NULL CHECK (length(trim(title)) >= 3),
  excerpt TEXT NOT NULL CHECK (length(trim(excerpt)) >= 10),
  content TEXT NOT NULL CHECK (length(trim(content)) >= 20),
  category TEXT NOT NULL CHECK (length(trim(category)) >= 2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_career_resources_updated_at
  BEFORE UPDATE ON public.career_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 9. Table: audit_logs
-- Immutable security audit log for admin operations (review, export, status change).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 10. Indexes for Fast Filtering, Browsing and Security Queries
-- ----------------------------------------------------------------------------
-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_status_published
  ON public.jobs (status, published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs (slug);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs (category);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON public.jobs (work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs (employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON public.jobs (experience_min, experience_max);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON public.jobs (application_deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs (featured) WHERE featured = true;

-- Applications
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications (email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications (created_at DESC);

-- Enquiries & Reports
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON public.enquiries (enquiry_type);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_reports_job_id ON public.job_reports (job_id);
CREATE INDEX IF NOT EXISTS idx_job_reports_status ON public.job_reports (status);

-- Career Resources
CREATE INDEX IF NOT EXISTS idx_career_resources_status_pub
  ON public.career_resources (status, published_at DESC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_career_resources_slug ON public.career_resources (slug);

-- Admin Profiles & Audit Logs
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles (role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
