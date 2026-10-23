# Akshitha Edutech — Supabase Database, RLS & Storage Runbook

This document details the database architecture, Row-Level Security (RLS) model, private resume storage rules, and the first-admin provisioning procedure for **Akshitha Edutech Private Limited**.

---

## 🗄️ Database Migrations

All schema changes are version-controlled under `supabase/migrations/`:

| Migration File | Description |
|---|---|
| `20261023000001_initial_schema.sql` | Creates 8 core tables (`company_settings`, `admin_profiles`, `jobs`, `applications`, `enquiries`, `job_reports`, `career_resources`, `audit_logs`), timestamp triggers, foreign keys, and performance indexes. |
| `20261023000002_rls_and_storage.sql` | Enables RLS across all tables, creates `is_admin()` and `is_super_admin()` security functions, defines access policies, and provisions the private `resumes` storage bucket with strict RLS. |

---

## 🛡️ Row-Level Security (RLS) & Access Rules

### 1. Anonymous / Public Candidates
- **Students and Employers NEVER have login accounts**. There is no signup page for candidates.
- **Jobs**: Can `SELECT` only where `status = 'published'` and `(application_deadline IS NULL OR application_deadline >= CURRENT_TIMESTAMP)`. Drafts, closed, and archived jobs are completely hidden.
- **Applications**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` are **100% blocked** from client API calls. Candidate applications will be processed exclusively through server-side actions that validate input schemas, rate limits, and PDF files.
- **Enquiries & Job Reports**: Direct client access blocked. Server endpoints validate and record entries.
- **Career Resources**: Can `SELECT` only published articles.
- **Company Settings**: Can `SELECT` public contact details and social links.

### 2. Authorized Administrators
- Authorization is checked via `public.is_admin()`, a `SECURITY DEFINER` function that queries `public.admin_profiles` using verified `auth.uid()`.
- Client-supplied metadata or JWT role claims are **never trusted** directly for administrative decisions.
- Admins can manage the full lifecycle of jobs (`draft` → `published` → `closed` → `archived`), review applications, and triage enquiries.
- Super Admins can manage admin profiles and delete sensitive candidate data when required for compliance.

### 3. Application History Preservation
- The foreign key constraint `applications.job_id REFERENCES jobs(id) ON DELETE RESTRICT` guarantees that jobs with candidate applications cannot be accidentally deleted from the database. Jobs should be transitioned to `'closed'` or `'archived'` status instead.

### 4. Trust Assumptions: Why RLS Alone is Not Sufficient
RLS is an essential defense-in-depth layer at the database level, but robust application security also requires:
1. **Server-Side Validation**: All public forms must be validated on the server with Zod.
2. **Abuse Protection & Rate Limiting**: Preventing automated spam or bot denial-of-service on public forms.
3. **MIME & Magic-Byte Verification**: Resumes must be inspected for actual `%PDF-` file signatures before storage, preventing malicious executable uploads.
4. **Service-Role Isolation**: Server secrets must never leak to the browser.

---

## 🔒 Private Resume Storage Architecture

### Bucket Configuration
- **Bucket ID**: `resumes`
- **Visibility**: `public = false` (Strictly private; direct public URLs will return HTTP 403 / 404).
- **File Size Limit**: `5242880` bytes (5 MB).
- **Allowed MIME Types**: `['application/pdf']`.

### Storage Security Policies
- **Anonymous Access**: Completely denied. No anonymous reads, uploads, or listings.
- **Upload Flow**: Candidate uploads are processed by a validated server endpoint that stores the file using an opaque, unguessable path:
  ```text
  resumes/{job_id}/{application_id}/{random_uuid}.pdf
  ```
- **Admin Download Flow**:
  1. Admin requests resume download in the protected admin dashboard.
  2. The server verifies admin session identity.
  3. The server issues a short-lived signed URL (60-second expiry) using `@supabase/supabase-js` storage API.
  4. The candidate's contact details and resume are never exposed to public internet crawlers.

---

## 👤 First-Admin Provisioning Guide

There is **NO public admin registration** in the portal to eliminate self-registration attack vectors.

### Step-by-Step Procedure to Provision the First Administrator:

1. **Create the Auth User in Supabase**:
   In your Supabase project dashboard (or local Supabase Studio), navigate to **Authentication → Users → Add User → Create User**. Enter the administrator's email and a strong password.

2. **Retrieve the User UUID**:
   Copy the generated `UUID` from the Auth Users list.

3. **Insert the Administrator Profile via SQL**:
   Run the following query in the Supabase SQL Editor:
   ```sql
   INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
   VALUES (
     'PASTE_AUTH_USER_UUID_HERE',
     'admin@akshithaedutech.com',
     'System Administrator',
     'super_admin',
     true
   );
   ```

4. **Verify Administrative Access**:
   The provisioned administrator can now log in at `/admin/login`. Any attempt by an unprovisioned user to sign in will be rejected by the admin authentication middleware and RLS checks.

---

## 🧪 Local Testing & Mock Data

To populate your local database with mock listings (Freshers, Experienced, Drafts, Closed roles):

```bash
# Using Supabase CLI locally:
supabase db reset
# Or run migrations and seed directly:
supabase migration up
```
*(Seed data is in `supabase/seed.sql` and marked for development use only).*
