import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 2: Database Schema, RLS, and Storage Security Verification', () => {
  const migrationsDir = path.resolve(import.meta.dirname, '../../supabase/migrations');
  const seedPath = path.resolve(import.meta.dirname, '../../supabase/seed.sql');
  const schemaFile = path.join(migrationsDir, '20261023000001_initial_schema.sql');
  const rlsFile = path.join(migrationsDir, '20261023000002_rls_and_storage.sql');

  it('migration and seed files should exist and be readable', () => {
    expect(fs.existsSync(schemaFile)).toBe(true);
    expect(fs.existsSync(rlsFile)).toBe(true);
    expect(fs.existsSync(seedPath)).toBe(true);
  });

  const schemaSql = fs.readFileSync(schemaFile, 'utf-8');
  const rlsSql = fs.readFileSync(rlsFile, 'utf-8');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');

  it('should define all 8 required portal tables', () => {
    const requiredTables = [
      'company_settings',
      'admin_profiles',
      'jobs',
      'applications',
      'enquiries',
      'job_reports',
      'career_resources',
      'audit_logs',
    ];

    for (const table of requiredTables) {
      const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`, 'i');
      expect(schemaSql).toMatch(tableRegex);
    }
  });

  it('should enforce application history preservation via ON DELETE RESTRICT on applications.job_id', () => {
    expect(schemaSql).toContain('job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT');
  });

  it('should enforce auth.users foreign key on admin_profiles with CASCADE', () => {
    expect(schemaSql).toContain('id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE');
  });

  it('should enforce experience and salary constraints on jobs', () => {
    expect(schemaSql).toContain('experience_min >= 0');
    expect(schemaSql).toContain('experience_max >= experience_min');
    expect(schemaSql).toContain('salary_max >= salary_min');
    expect(schemaSql).toContain('openings >= 1');
  });

  it('should enable Row Level Security on all 8 tables', () => {
    const rlsTables = [
      'company_settings',
      'admin_profiles',
      'jobs',
      'applications',
      'enquiries',
      'job_reports',
      'career_resources',
      'audit_logs',
    ];

    for (const table of rlsTables) {
      const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
      expect(rlsSql).toMatch(rlsRegex);
    }
  });

  it('should define security definer is_admin() and is_super_admin() with search_path protection', () => {
    expect(rlsSql).toContain('CREATE OR REPLACE FUNCTION public.is_admin()');
    expect(rlsSql).toContain('CREATE OR REPLACE FUNCTION public.is_super_admin()');
    expect(rlsSql).toContain('SECURITY DEFINER');
    expect(rlsSql).toContain('SET search_path = public, auth');
  });

  it('should restrict public job access to published and non-expired listings', () => {
    expect(rlsSql).toContain("status = 'published'");
    expect(rlsSql).toContain('application_deadline >= CURRENT_TIMESTAMP');
  });

  it('should deny anonymous direct access to private applications and enquiries', () => {
    // Assert no public/anon policies grant access to applications or enquiries
    expect(rlsSql).not.toMatch(/CREATE POLICY .* ON public\.applications FOR (SELECT|INSERT|UPDATE|DELETE) TO (anon|public)/i);
    expect(rlsSql).not.toMatch(/CREATE POLICY .* ON public\.enquiries FOR (SELECT|INSERT|UPDATE|DELETE) TO (anon|public)/i);
  });

  it('should configure resumes storage bucket as private with 5MB limit and PDF mime restriction', () => {
    expect(rlsSql).toContain("'resumes'");
    expect(rlsSql).toContain('5242880'); // 5 MB
    expect(rlsSql).toContain("'application/pdf'");
    expect(rlsSql).toContain('public = false');
  });

  it('should not contain real production passwords, credentials, or secrets in seed or migrations', () => {
    const combined = schemaSql + rlsSql + seedSql;
    expect(combined).not.toMatch(/service_role_key/i);
    expect(combined).not.toMatch(/eyJhbGci/); // no JWTs
    expect(combined).not.toMatch(/supersecret/i);
  });
});
