'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job, JobStatus, WorkMode, EmploymentType } from '@/types/database';
import { createAdminJob, updateAdminJob } from '@/app/actions/admin-job-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export interface JobFormProps {
  initialJob?: Job | null;
}

export function JobForm({ initialJob }: JobFormProps) {
  const router = useRouter();
  const isEditing = !!initialJob;

  // Form State
  const [title, setTitle] = React.useState(initialJob?.title || '');
  const [slug, setSlug] = React.useState(initialJob?.slug || '');
  const [companyName, setCompanyName] = React.useState(
    initialJob?.company_name || 'Akshitha Edutech Private Limited'
  );
  const [location, setLocation] = React.useState(initialJob?.location || '');
  const [workMode, setWorkMode] = React.useState<WorkMode>(initialJob?.work_mode || 'hybrid');
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>(
    initialJob?.employment_type || 'full-time'
  );
  const [category, setCategory] = React.useState(initialJob?.category || 'Engineering');
  const [description, setDescription] = React.useState(initialJob?.description || '');
  const [openings, setOpenings] = React.useState<number>(initialJob?.openings || 1);
  const [experienceMin, setExperienceMin] = React.useState<number>(initialJob?.experience_min ?? 0);
  const [experienceMax, setExperienceMax] = React.useState<number>(initialJob?.experience_max ?? 2);
  const [salaryMin, setSalaryMin] = React.useState<string>(
    initialJob?.salary_min ? String(initialJob.salary_min) : ''
  );
  const [salaryMax, setSalaryMax] = React.useState<string>(
    initialJob?.salary_max ? String(initialJob.salary_max) : ''
  );
  const [applicationDeadline, setApplicationDeadline] = React.useState<string>(
    initialJob?.application_deadline ? initialJob.application_deadline.slice(0, 16) : ''
  );
  const [applicationInstructions, setApplicationInstructions] = React.useState<string>(
    initialJob?.application_instructions || ''
  );
  const [status, setStatus] = React.useState<JobStatus>(initialJob?.status || 'draft');
  const [featured, setFeatured] = React.useState<boolean>(initialJob?.featured || false);

  // Dynamic Array Fields
  const [responsibilities, setResponsibilities] = React.useState<string[]>(
    initialJob?.responsibilities && initialJob.responsibilities.length > 0
      ? initialJob.responsibilities
      : ['']
  );
  const [qualifications, setQualifications] = React.useState<string[]>(
    initialJob?.qualifications && initialJob.qualifications.length > 0
      ? initialJob.qualifications
      : ['']
  );
  const [skills, setSkills] = React.useState<string[]>(
    initialJob?.skills && initialJob.skills.length > 0 ? initialJob.skills : ['']
  );
  const [newSkillInput, setNewSkillInput] = React.useState('');

  // UI / Submission State
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Auto-generate slug from title
  const handleGenerateSlug = () => {
    if (!title.trim()) return;
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  // List helpers
  const handleArrayChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleArrayAdd = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const handleArrayRemove = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev.filter((s) => s.length > 0), trimmed]);
      setNewSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSaving(true);

    try {
      // Clean lists
      const cleanResponsibilities = responsibilities.map((r) => r.trim()).filter((r) => r.length > 0);
      const cleanQualifications = qualifications.map((q) => q.trim()).filter((q) => q.length > 0);
      const cleanSkills = skills.map((s) => s.trim()).filter((s) => s.length > 0);

      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        company_name: companyName.trim(),
        location: location.trim(),
        work_mode: workMode,
        employment_type: employmentType,
        category: category.trim(),
        description: description.trim(),
        responsibilities: cleanResponsibilities,
        qualifications: cleanQualifications,
        skills: cleanSkills,
        experience_min: Number(experienceMin),
        experience_max: Number(experienceMax),
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        openings: Number(openings),
        application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
        application_instructions: applicationInstructions.trim() || null,
        status,
        featured,
      };

      const res = isEditing
        ? await updateAdminJob(initialJob!.id, payload)
        : await createAdminJob(payload);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to save job posting.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setSaving(false);
        return;
      }

      router.push('/admin/jobs');
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Job submission failed.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/jobs" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Job Postings
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isEditing ? `Edit Posting: ${initialJob?.title}` : 'Create New Job Posting'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill in the job details adhering to strict verified company specifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={!title}
          >
            Candidate Preview ↗
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
        >
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Section 1: Core Identification & URL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            1. Core Position Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="job-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Job Title *
              </label>
              <Input
                id="job-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Graduate Trainee - Software Engineer"
                required
                className={fieldErrors.title ? 'border-rose-500' : ''}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Slug */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="job-slug" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  URL Slug * (must be unique)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Generate from title
                </button>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 font-mono">
                  /jobs/
                </span>
                <Input
                  id="job-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="graduate-trainee-software-engineer"
                  required
                  className={`font-mono text-sm ${fieldErrors.slug ? 'border-rose-500' : ''}`}
                />
              </div>
              {fieldErrors.slug && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.slug[0]}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="job-company" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Company Name *
              </label>
              <Input
                id="job-company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="job-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <Input
                id="job-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Engineering, Operations, Counseling..."
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="job-location" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Location *
              </label>
              <Input
                id="job-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bengaluru, Karnataka or Remote (India)"
                required
              />
            </div>

            {/* Work Mode */}
            <div>
              <label htmlFor="job-work-mode" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Work Mode *
              </label>
              <select
                id="job-work-mode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label htmlFor="job-employment-type" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Employment Type *
              </label>
              <select
                id="job-employment-type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Openings */}
            <div>
              <label htmlFor="job-openings" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Openings *
              </label>
              <Input
                id="job-openings"
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(parseInt(e.target.value, 10) || 1)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Compensation & Experience */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            2. Compensation & Experience Requirements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Experience Range */}
            <div>
              <label htmlFor="job-exp-min" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Min Experience (Years) *
              </label>
              <Input
                id="job-exp-min"
                type="number"
                min={0}
                max={40}
                value={experienceMin}
                onChange={(e) => setExperienceMin(parseInt(e.target.value, 10) || 0)}
                required
              />
            </div>

            <div>
              <label htmlFor="job-exp-max" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Max Experience (Years) *
              </label>
              <Input
                id="job-exp-max"
                type="number"
                min={0}
                max={50}
                value={experienceMax}
                onChange={(e) => setExperienceMax(parseInt(e.target.value, 10) || 0)}
                required
                className={fieldErrors.experience_max ? 'border-rose-500' : ''}
              />
              {fieldErrors.experience_max && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.experience_max[0]}</p>
              )}
            </div>

            {/* Salary Range */}
            <div>
              <label htmlFor="job-sal-min" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Salary Min (INR / Year)
              </label>
              <Input
                id="job-sal-min"
                type="number"
                min={0}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g. 450000 (4.5 LPA)"
              />
            </div>

            <div>
              <label htmlFor="job-sal-max" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Salary Max (INR / Year)
              </label>
              <Input
                id="job-sal-max"
                type="number"
                min={0}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="e.g. 650000 (6.5 LPA)"
                className={fieldErrors.salary_max ? 'border-rose-500' : ''}
              />
              {fieldErrors.salary_max && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.salary_max[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Detailed Description & Responsibilities */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            3. Job Overview & Detailed Breakdown
          </h2>

          {/* Description */}
          <div>
            <label htmlFor="job-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Role Description * (minimum 20 characters)
            </label>
            <Textarea
              id="job-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive summary of the team, role impact, and mission..."
              required
              className={fieldErrors.description ? 'border-rose-500' : ''}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.description[0]}</p>
            )}
          </div>

          {/* Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Key Responsibilities *
              </label>
              <button
                type="button"
                onClick={() => handleArrayAdd(setResponsibilities)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                + Add Responsibility
              </button>
            </div>
            <div className="space-y-2">
              {responsibilities.map((resp, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={resp}
                    onChange={(e) => handleArrayChange(i, e.target.value, setResponsibilities)}
                    placeholder={`Responsibility #${i + 1}`}
                    required
                  />
                  {responsibilities.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayRemove(i, setResponsibilities)}
                      className="text-rose-600"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {fieldErrors.responsibilities && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.responsibilities[0]}</p>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Qualifications & Requirements *
              </label>
              <button
                type="button"
                onClick={() => handleArrayAdd(setQualifications)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                + Add Qualification
              </button>
            </div>
            <div className="space-y-2">
              {qualifications.map((qual, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={qual}
                    onChange={(e) => handleArrayChange(i, e.target.value, setQualifications)}
                    placeholder={`Qualification requirement #${i + 1}`}
                    required
                  />
                  {qualifications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayRemove(i, setQualifications)}
                      className="text-rose-600"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {fieldErrors.qualifications && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.qualifications[0]}</p>
            )}
          </div>

          {/* Skills Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Required Skills & Technologies *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills
                .filter((s) => s.length > 0)
                .map((skill, i) => (
                  <Badge key={i} variant="default" className="gap-1.5 py-1 px-3">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                      className="text-xs hover:text-rose-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill (e.g. React, Next.js, PostgreSQL) and click Add"
              />
              <Button type="button" variant="secondary" onClick={handleAddSkill}>
                Add Tag
              </Button>
            </div>
            {fieldErrors.skills && (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.skills[0]}</p>
            )}
          </div>
        </div>

        {/* Section 4: Publishing Status & Deadline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            4. Lifecycle, Deadlines & Instructions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Status */}
            <div>
              <label htmlFor="job-status" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Posting Status *
              </label>
              <select
                id="job-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
              >
                <option value="draft">Draft (Private, not visible on public portal)</option>
                <option value="published">Published (Live & accepting candidate applications)</option>
                <option value="closed">Closed (No longer accepting new applications)</option>
                <option value="archived">Archived (Stored for historic audit)</option>
              </select>
            </div>

            {/* Application Deadline */}
            <div>
              <label htmlFor="job-deadline" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Application Deadline (Optional)
              </label>
              <Input
                id="job-deadline"
                type="datetime-local"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
              />
            </div>

            {/* Application Instructions */}
            <div className="md:col-span-2">
              <label htmlFor="job-instructions" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Application Instructions (Optional)
              </label>
              <Input
                id="job-instructions"
                value={applicationInstructions}
                onChange={(e) => setApplicationInstructions(e.target.value)}
                placeholder="e.g. Direct application. Attach your PDF resume highlighting academic projects."
              />
            </div>

            {/* Featured Checkbox */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input
                id="job-featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="job-featured" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Highlight as Featured Position on Homepage and Jobs Portal
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link href="/admin/jobs">
            <Button type="button" variant="outline" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="shadow-md shadow-blue-500/20 px-8">
            {saving ? 'Saving Job Posting...' : isEditing ? 'Update Job Posting' : 'Publish Job Posting'}
          </Button>
        </div>
      </form>

      {/* Candidate View Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400">
                  Live Candidate Preview
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {title || 'Job Title Placeholder'}
                </h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>

            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{companyName}</Badge>
                <Badge variant="secondary">{location || 'Location'}</Badge>
                <Badge variant="default">{workMode}</Badge>
                <Badge variant="default">{employmentType}</Badge>
                <Badge variant="success">
                  {experienceMin}–{experienceMax} Years Exp
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  About the Role
                </h4>
                <p className="whitespace-pre-line text-slate-600 dark:text-slate-400">
                  {description || 'No description provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Responsibilities
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  {responsibilities
                    .filter((r) => r.trim().length > 0)
                    .map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Qualifications
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  {qualifications
                    .filter((q) => q.trim().length > 0)
                    .map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Skills & Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {skills
                    .filter((s) => s.trim().length > 0)
                    .map((s, i) => (
                      <Badge key={i} variant="outline">
                        {s}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={() => setPreviewOpen(false)}>Done Previewing</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
