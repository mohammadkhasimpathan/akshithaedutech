-- ============================================================================
-- Akshitha Edutech Private Limited — Job Portal Security Migration
-- Migration: 20261023000002_rls_and_storage.sql
-- Description: Row Level Security (RLS) policies, RBAC functions, and Private Storage.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Authorization Helper Functions (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Evaluates whether the currently authenticated user is an authorized internal admin.
-- Runs with DEFINER rights to safely check public.admin_profiles without circular RLS dependencies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
  -- If not logged in, reject immediately
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor')
  );
END;
$$;

-- Evaluates whether the user has super_admin privileges (can manage admin profiles and delete sensitive data).
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role = 'super_admin'
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Enable Row Level Security (RLS) on All Portal Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. RLS Policies: jobs
-- Public: Read only active, published, and non-expired listings.
-- Admin: Full lifecycle management (Draft, Publish, Close, Archive).
-- ----------------------------------------------------------------------------
CREATE POLICY "jobs_public_read_active"
  ON public.jobs
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND (application_deadline IS NULL OR application_deadline >= CURRENT_TIMESTAMP)
  );

CREATE POLICY "jobs_admin_all"
  ON public.jobs
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. RLS Policies: career_resources
-- Public: Read published career guidance and articles.
-- Admin: Full authoring and publishing access.
-- ----------------------------------------------------------------------------
CREATE POLICY "career_resources_public_read"
  ON public.career_resources
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "career_resources_admin_all"
  ON public.career_resources
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. RLS Policies: company_settings
-- Public: Read active public contact details and social links.
-- Admin: Manage company metadata.
-- ----------------------------------------------------------------------------
CREATE POLICY "company_settings_public_read"
  ON public.company_settings
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "company_settings_admin_manage"
  ON public.company_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. RLS Policies: applications
-- Public: ZERO direct client access (NO SELECT, NO INSERT, NO UPDATE, NO DELETE).
-- Submissions are handled exclusively via validated Next.js server actions using service-role.
-- Admin: Read candidate applications and update review status.
-- Super Admin: Delete applications if required for compliance.
-- ----------------------------------------------------------------------------
CREATE POLICY "applications_admin_read"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "applications_admin_update"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "applications_super_admin_delete"
  ON public.applications
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 7. RLS Policies: enquiries
-- Public: ZERO direct client access. Submissions validated on server.
-- Admin: Read, update triage status, and manage enquiries.
-- ----------------------------------------------------------------------------
CREATE POLICY "enquiries_admin_manage"
  ON public.enquiries
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. RLS Policies: job_reports
-- Public: ZERO direct client access. Submissions validated on server.
-- Admin: Read and review flagged job reports.
-- ----------------------------------------------------------------------------
CREATE POLICY "job_reports_admin_manage"
  ON public.job_reports
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. RLS Policies: admin_profiles
-- Admin: Read fellow administrator profiles.
-- Super Admin: Manage roles and provision new administrators (prevents self-escalation).
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_profiles_admin_read"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_profiles_super_admin_manage"
  ON public.admin_profiles
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 10. RLS Policies: audit_logs
-- Immutable logs: No client INSERT/UPDATE/DELETE. Server service-role logs events.
-- Admin: Read audit history.
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_logs_admin_read"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. Private Resume Storage Configuration & Bucket Setup
-- ----------------------------------------------------------------------------
-- Create private 'resumes' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880, -- 5 MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Storage Object RLS Policies
-- Public/Anon: Completely denied direct access to objects in 'resumes'.
-- Authenticated Admins: Can view/download resumes via short-lived signed URLs.
CREATE POLICY "resumes_admin_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND public.is_admin()
  );

CREATE POLICY "resumes_super_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND public.is_super_admin()
  );
