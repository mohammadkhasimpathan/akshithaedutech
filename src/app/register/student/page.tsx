'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitStudentRegistration } from '@/app/actions/registration-actions';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'Data Analysis',
  'Digital Marketing',
  'Communication',
];

const OPPORTUNITY_OPTIONS = [
  { id: 'jobs', label: 'Full-Time Private Sector Jobs' },
  { id: 'internships', label: 'Internships & Trainee Roles' },
  { id: 'career_guidance', label: '1-on-1 Career Mentorship & Guidance' },
  { id: 'skill_development', label: 'Technical & Soft Skill Training' },
  { id: 'placement_support', label: 'Campus & Off-Campus Placement Drives' },
];

export default function StudentRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [skillsList, setSkillsList] = React.useState<string[]>([]);
  const [customSkill, setCustomSkill] = React.useState('');
  const [experienceStatus, setExperienceStatus] = React.useState<'fresher' | 'experienced'>('fresher');
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>(['jobs', 'internships']);

  const [result, setResult] = React.useState<{
    success: boolean;
    referenceId?: string;
    message?: string;
  } | null>(null);

  const toggleSkill = (skill: string) => {
    setSkillsList((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only PDF files are accepted.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Resume file must be 5 MB or smaller.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (skillsList.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        skills: ['Please select or add at least one core skill.'],
      }));
      return;
    }

    if (selectedInterests.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        opportunity_interests: ['Please select at least one opportunity interest.'],
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Append skills
      formData.delete('skills');
      skillsList.forEach((s) => formData.append('skills', s));

      // Append interests
      formData.delete('opportunity_interests');
      selectedInterests.forEach((i) => formData.append('opportunity_interests', i));

      // Append file if selected
      if (selectedFile) {
        formData.set('resume', selectedFile);
      }

      const res = await submitStudentRegistration(formData);

      if (!res.success) {
        setFormError(res.error || 'Failed to submit registration. Please verify all fields.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      setResult({
        success: true,
        referenceId: res.referenceId,
        message: res.message,
      });
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'An unexpected error occurred during submission.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Registration Confirmed!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
              {result.message}
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                Registration Reference ID
              </span>
              <p className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400 mt-1">
                {result.referenceId}
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Please keep your reference ID for correspondence. Our talent advisory team reviews incoming profiles on a rolling basis.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/jobs" className="flex-1">
                <Button className="w-full">Browse Open Jobs</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">Back to Home</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student & Fresher Talent Intake</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Launch Your Private Sector Career
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Register your profile with Akshitha Edutech to gain access to curated private-sector openings, structured internships, verified campus drives, and tailored career mentorship.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>No account or password required. Zero registration charges.</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
          {formError && (
            <div
              role="alert"
              className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Honeypot for spam bots */}
            <input
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {/* 1. Basic Contact Information */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Personal & Contact Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="full_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="e.g. Ananya Sharma"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.full_name ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.full_name && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.full_name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.email ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Number *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.phone ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Current City *
                  </label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="e.g. Bengaluru"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.city ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.city && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.city[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    State / Region *
                  </label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="e.g. Karnataka"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.state ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.state && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.state[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Academic Background */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Academic Background
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="college_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    College / Institution Name *
                  </label>
                  <Input
                    id="college_name"
                    name="college_name"
                    placeholder="e.g. RV College of Engineering"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.college_name ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.college_name && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.college_name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="course" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Degree / Course *
                  </label>
                  <Input
                    id="course"
                    name="course"
                    placeholder="e.g. B.Tech / MCA / B.Sc"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.course ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.course && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.course[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="specialization" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Specialization / Branch *
                  </label>
                  <Input
                    id="specialization"
                    name="specialization"
                    placeholder="e.g. Computer Science / Mechanical"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.specialization ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.specialization && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.specialization[0]}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="graduation_year" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Year of Graduation *
                  </label>
                  <Input
                    id="graduation_year"
                    name="graduation_year"
                    type="number"
                    min={2000}
                    max={2040}
                    defaultValue={2026}
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.graduation_year ? 'border-rose-500' : ''}
                  />
                  {fieldErrors.graduation_year && (
                    <p className="text-xs text-rose-500 mt-1">{fieldErrors.graduation_year[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Skills and Interests */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Skills & Career Preferences
                </h2>
              </div>

              {/* Experience Status */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Experience Status *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="experience_status"
                      value="fresher"
                      checked={experienceStatus === 'fresher'}
                      onChange={() => setExperienceStatus('fresher')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Fresher (0 - 1 year)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="experience_status"
                      value="experienced"
                      checked={experienceStatus === 'experienced'}
                      onChange={() => setExperienceStatus('experienced')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Experienced Professional</span>
                  </label>
                </div>

                {experienceStatus === 'experienced' && (
                  <div className="mt-3 max-w-xs">
                    <label htmlFor="experience_years" className="block text-xs text-slate-500 mb-1">
                      Years of Experience
                    </label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      step="0.5"
                      min={0}
                      max={40}
                      defaultValue={1}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>

              {/* Skills selection */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Core Skills & Competencies *
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_SKILLS.map((skill) => {
                    const isSelected = skillsList.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-3 py-1.5 rounded-full transition font-medium ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill and press Enter"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={addCustomSkill}
                    disabled={isSubmitting}
                  />
                  <Button type="button" variant="outline" onClick={addCustomSkill}>
                    Add
                  </Button>
                </div>

                {skillsList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-xs text-slate-500 mr-1 self-center">Selected:</span>
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className="hover:text-rose-500 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {fieldErrors.skills && (
                  <p className="text-xs text-rose-500 mt-1">{fieldErrors.skills[0]}</p>
                )}
              </div>

              {/* Opportunity Interests */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  What opportunities are you looking for? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OPPORTUNITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(opt.id)}
                        onChange={() => toggleInterest(opt.id)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
                {fieldErrors.opportunity_interests && (
                  <p className="text-xs text-rose-500 mt-1">{fieldErrors.opportunity_interests[0]}</p>
                )}
              </div>

              {/* Preferred Locations */}
              <div>
                <label htmlFor="preferred_locations" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Work Locations (Optional)
                </label>
                <Input
                  id="preferred_locations"
                  name="preferred_locations"
                  placeholder="e.g. Bengaluru, Hyderabad, Chennai, Remote"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* 4. Optional Resume Upload */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Resume / CV (Optional)
                </h2>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition">
                <input
                  id="resume-file"
                  name="resume"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Genuine PDF verified
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-rose-600 hover:text-rose-700 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Upload your PDF resume (max 5 MB)
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Our platform verifies PDF magic bytes to protect candidate security.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('resume-file')?.click()}
                      className="mt-3"
                    >
                      Select File
                    </Button>
                  </div>
                )}

                {fileError && <p className="text-xs text-rose-500 mt-2">{fileError}</p>}
                {fieldErrors.resume && <p className="text-xs text-rose-500 mt-2">{fieldErrors.resume[0]}</p>}
              </div>
            </div>

            {/* 5. Privacy Consent & Submission */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  defaultChecked
                  className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  I consent to Akshitha Edutech Private Limited collecting and processing my career and academic profile in accordance with the{' '}
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700">
                    Privacy Policy
                  </Link>
                  . Information is collected solely for career guidance, recruitment match-making, and placement drive participation.
                </span>
              </label>
              {fieldErrors.consent && (
                <p className="text-xs text-rose-500 mb-4">{fieldErrors.consent[0]}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? 'Submitting Registration...' : 'Complete Student Registration'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
  );
}
