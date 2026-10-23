# Akshitha Edutech Private Limited — Private-Sector Job Portal

A production-quality private-sector job portal connecting freshers and experienced candidates directly with career opportunities without mandatory candidate account registration. Built with Next.js 16 App Router (Turbopack, Cache Components, Partial Prerendering), React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, and private Storage), and Zod validation.

GitHub Repository: [https://github.com/mohammadkhasimpathan/akshithaedutech](https://github.com/mohammadkhasimpathan/akshithaedutech)

---

## 🎯 Architecture & Security Highlights

- **Accountless Public Candidate & Registration Journey**: Public visitors can browse, search, filter, and apply directly with PDF resume uploads without creating accounts or credentials.
- **Stakeholder Registration Workflows (No Client Accounts)**:
  - **Student / Fresher Registration** (`/register/student`): Career guidance, internships, fresher jobs, and placement drive intake. Optional verified PDF resume upload.
  - **Employer Registration** (`/register/employer`): Corporate hiring collaboration, talent requirements, and drive requests. All submissions enter a pending-review workflow. Anonymous users cannot publish jobs directly.
  - **College / Institution Registration** (`/register/college`): Academic placement partnerships, campus drives, and student workshops with pending-review administrative validation.
- **Admin-Only Authentication**: Only authorized administrators authenticate via Supabase Auth into `/admin`. Development quick-fill buttons and mock notices have been stripped from the production login UI. Real logins strictly verify an active `admin_profiles` record.
- **Next.js 16 Partial Prerendering (PPR) Compliance**: Dynamic server calls (`connection()`) are safely contained inside `<React.Suspense>` boundaries with skeleton fallbacks, ensuring instant static shell delivery and partial prefetching.
- **Private Storage**: Resumes are secured in a private object storage bucket (`resumes`); administrators access them strictly via short-lived signed URLs (60-second expiration).
- **Server-Side Security**: Input validation via Zod, SHA-256 client hashing for rate limiting, honeypot anti-spam defense, and zero exposure of service-role keys to browser clients.

---

## 📋 Implementation Checklist

- [x] **Core Job Portal Scaffolding & Engineering Foundation**
  - Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4
  - Vitest + Testing Library + Playwright E2E setups
  - Atomic UI design system (`Button`, `Badge`, `Card`, `Input`, `Textarea`, `Dialog`)
- [x] **Database Schema, RLS & Storage Security**
  - Supabase SQL migrations:
    - `20261023000001_initial_schema.sql` (core portal schema)
    - `20261023000002_rls_and_storage.sql` (RLS policies, `is_admin()` definer, private storage)
    - `20261023000003_registrations_schema.sql` (`student_registrations`, `employer_registrations`, `college_registrations` with RLS)
  - Strict Row-Level Security (RLS) policies on all tables
  - Private resume bucket setup (5MB limit, genuine `%PDF-` MIME restriction)
- [x] **Public Candidate Experience & Job Discovery**
  - Vibrant mobile-first responsive homepage & job listings (`/jobs`)
  - Fresher vs Experienced filters, salary, location, job type
  - Direct candidate apply flow with PDF upload & validation
  - Job report and career enquiry forms
  - Career guidance resources (`/resources`)
- [x] **Stakeholder Intake Workflows**
  - `/register/student` with skills tags, opportunity interests, and optional resume upload
  - `/register/employer` with hiring volume, opportunity types, and pending-review notice
  - `/register/college` with institution category, placement cell details, and partnership focus
- [x] **Admin Operations Portal**
  - Dedicated `/admin` route group with Supabase Auth
  - Server-side authorization & session verification (`requireAdminAuth()`)
  - Job lifecycle management (Draft, Published, Closed, Archived)
  - Candidate review dossier with secured signed PDF download links
  - Enquiries and job report triage inboxes with private notes
  - Registrations management (`/admin/registrations`) with triage/review actions and private notes
- [x] **Testing, Verification & Production Hardening**
  - Vitest unit test suite (12 test suites, 128 tests passed)
  - Playwright end-to-end suite (12 browser journeys passed)
  - Next.js production build verified (24 routes prerendered / PPR enabled)
  - Clean ESLint and strict TypeScript typechecking

---

## 🛠️ Development & Quality Commands

```bash
# Run local development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run ESLint
npm run lint

# Run Vitest unit & integration tests
npm test

# Run Playwright E2E tests
npm run test:e2e

# Run optimized production build
npm run build
```

---

## 🔐 Environment Setup

Copy `.env.example` to `.env.local` and configure your Supabase credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (`https://<project-ref>.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Safe public anonymous client key
- `SUPABASE_SERVICE_ROLE_KEY`: Private server-only key for administrative operations (never expose to client)
- `NEXT_PUBLIC_ENABLE_LOCAL_MOCKS`: Set to `false` for real Supabase operation, or `true` for offline/mock development.

---

## 🚀 Safe Production Deployment Checklist

1. **Verify Environment Isolation**:
   - Ensure development project (`akshitha-edutech-dev`) is separate from production.
   - Run migrations only forward using `npx supabase db push`.
2. **Secrets & Keys**:
   - Ensure `.env.local` is never committed to version control (`.gitignore` enforces `.env*`).
   - Configure environment variables securely in your hosting platform (Vercel, AWS, etc.).
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is marked as sensitive/secret and only accessible server-side.
3. **Storage Security**:
   - Verify `resumes` bucket is marked as **Private** in Supabase Storage.
   - Ensure signed URL expiry remains strictly set to 60 seconds.
4. **Admin Provisioning**:
   - Create initial administrator in Supabase Auth (`auth.users`).
   - Insert corresponding record into `public.admin_profiles` with `role = 'super_admin'` and `is_active = true`.
5. **Rate Limiting in Serverless Deployments**:
   - For multi-instance or high-traffic production environments, connect `MemoryRateLimitStore` in `src/lib/security/rate-limiter.ts` to a shared Redis/Upstash instance.
