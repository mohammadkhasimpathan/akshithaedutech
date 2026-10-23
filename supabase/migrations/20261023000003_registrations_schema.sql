-- ============================================================================
-- Akshitha Edutech Private Limited — Job Portal Registrations Schema
-- Migration: 20261023000003_registrations_schema.sql
-- Description: Student, Employer, and College registration workflows with RLS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: student_registrations
-- For students/freshers seeking career guidance, jobs, internships, and skill support.
-- Registration/interest intake only — NO authentication account.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) >= 2),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT NOT NULL CHECK (phone ~* '^\+?[0-9\s-]{10,15}$'),
  city TEXT NOT NULL CHECK (length(trim(city)) >= 2),
  state TEXT NOT NULL CHECK (length(trim(state)) >= 2),
  college_name TEXT NOT NULL CHECK (length(trim(college_name)) >= 2),
  course TEXT NOT NULL CHECK (length(trim(course)) >= 2),
  specialization TEXT NOT NULL CHECK (length(trim(specialization)) >= 2),
  graduation_year INTEGER NOT NULL CHECK (graduation_year >= 2000 AND graduation_year <= 2040),
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_status TEXT NOT NULL CHECK (experience_status IN ('fresher', 'experienced')),
  experience_years NUMERIC(4, 1) NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  opportunity_interests TEXT[] NOT NULL DEFAULT '{}',
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  resume_path TEXT,
  resume_original_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_student_registrations_updated_at
  BEFORE UPDATE ON public.student_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_student_registrations_status ON public.student_registrations(status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_email ON public.student_registrations(email);
CREATE INDEX IF NOT EXISTS idx_student_registrations_created_at ON public.student_registrations(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. Table: employer_registrations
-- For companies and recruiters requesting hiring collaborations, drives, or postings.
-- Submissions enter pending review — NO direct posting or client accounts.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employer_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL CHECK (length(trim(company_name)) >= 2),
  contact_person TEXT NOT NULL CHECK (length(trim(contact_person)) >= 2),
  business_email TEXT NOT NULL CHECK (business_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT NOT NULL CHECK (phone ~* '^\+?[0-9\s-]{10,15}$'),
  designation TEXT NOT NULL CHECK (length(trim(designation)) >= 2),
  website TEXT,
  industry TEXT NOT NULL CHECK (length(trim(industry)) >= 2),
  office_location TEXT NOT NULL CHECK (length(trim(office_location)) >= 2),
  hiring_needs TEXT NOT NULL CHECK (length(trim(hiring_needs)) >= 10),
  opportunity_types TEXT[] NOT NULL DEFAULT '{}',
  hiring_volume TEXT,
  collaboration_interests TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_employer_registrations_updated_at
  BEFORE UPDATE ON public.employer_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_employer_registrations_status ON public.employer_registrations(status);
CREATE INDEX IF NOT EXISTS idx_employer_registrations_email ON public.employer_registrations(business_email);
CREATE INDEX IF NOT EXISTS idx_employer_registrations_created_at ON public.employer_registrations(created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. Table: college_registrations
-- For educational institutions seeking placement collaborations, campus drives, and training.
-- Submissions enter pending review — NO auto-verification or public accounts.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.college_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL CHECK (length(trim(institution_name)) >= 2),
  institution_type TEXT NOT NULL CHECK (length(trim(institution_type)) >= 2),
  official_email TEXT NOT NULL CHECK (official_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_person TEXT NOT NULL CHECK (length(trim(contact_person)) >= 2),
  designation TEXT NOT NULL CHECK (length(trim(designation)) >= 2),
  phone TEXT NOT NULL CHECK (phone ~* '^\+?[0-9\s-]{10,15}$'),
  city TEXT NOT NULL CHECK (length(trim(city)) >= 2),
  state TEXT NOT NULL CHECK (length(trim(state)) >= 2),
  website TEXT,
  courses_departments TEXT[] NOT NULL DEFAULT '{}',
  student_strength TEXT,
  placement_cell_details TEXT NOT NULL CHECK (length(trim(placement_cell_details)) >= 10),
  collaboration_interests TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_college_registrations_updated_at
  BEFORE UPDATE ON public.college_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_college_registrations_status ON public.college_registrations(status);
CREATE INDEX IF NOT EXISTS idx_college_registrations_email ON public.college_registrations(official_email);
CREATE INDEX IF NOT EXISTS idx_college_registrations_created_at ON public.college_registrations(created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. Row Level Security (RLS) Configuration
-- Public: ZERO direct client access (NO SELECT, NO INSERT, NO UPDATE, NO DELETE).
-- Submissions are handled exclusively via validated Next.js Server Actions using service-role.
-- Admin: Read candidate submissions and update review status / internal notes.
-- Super Admin: Delete submissions if required for compliance.
-- ----------------------------------------------------------------------------
ALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_registrations ENABLE ROW LEVEL SECURITY;

-- Student Registrations RLS
CREATE POLICY "student_registrations_admin_read"
  ON public.student_registrations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "student_registrations_admin_update"
  ON public.student_registrations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "student_registrations_super_admin_delete"
  ON public.student_registrations
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- Employer Registrations RLS
CREATE POLICY "employer_registrations_admin_read"
  ON public.employer_registrations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "employer_registrations_admin_update"
  ON public.employer_registrations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "employer_registrations_super_admin_delete"
  ON public.employer_registrations
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- College Registrations RLS
CREATE POLICY "college_registrations_admin_read"
  ON public.college_registrations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "college_registrations_admin_update"
  ON public.college_registrations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "college_registrations_super_admin_delete"
  ON public.college_registrations
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());
