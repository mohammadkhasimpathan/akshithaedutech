'use client';

import * as React from 'react';
import {
  StudentRegistration,
  EmployerRegistration,
  CollegeRegistration,
  RegistrationStatus,
} from '@/types/database';
import {
  updateStudentRegistrationReview,
  updateEmployerRegistrationReview,
  updateCollegeRegistrationReview,
  getSecureStudentResumeDownloadUrlAction,
} from '@/app/actions/registration-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import {
  GraduationCap,
  Building2,
  School,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface RegistrationsClientProps {
  initialStudents: StudentRegistration[];
  initialEmployers: EmployerRegistration[];
  initialColleges: CollegeRegistration[];
}

export function RegistrationsClient({
  initialStudents,
  initialEmployers,
  initialColleges,
}: RegistrationsClientProps) {
  const [activeTab, setActiveTab] = React.useState<'students' | 'employers' | 'colleges'>('students');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const [students, setStudents] = React.useState(initialStudents);
  const [employers, setEmployers] = React.useState(initialEmployers);
  const [colleges, setColleges] = React.useState(initialColleges);

  // Review modal state
  const [reviewingItem, setReviewingItem] = React.useState<{
    type: 'student' | 'employer' | 'college';
    id: string;
    name: string;
    status: RegistrationStatus;
    notes: string;
  } | null>(null);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'reviewed':
        return <Badge variant="info">Reviewed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning">Pending Review</Badge>;
    }
  };

  const handleOpenReview = (
    type: 'student' | 'employer' | 'college',
    item: StudentRegistration | EmployerRegistration | CollegeRegistration
  ) => {
    const name =
      type === 'student'
        ? (item as StudentRegistration).full_name
        : type === 'employer'
        ? (item as EmployerRegistration).company_name
        : (item as CollegeRegistration).institution_name;

    setReviewingItem({
      type,
      id: item.id,
      name,
      status: item.status,
      notes: item.admin_notes || '',
    });
    setUpdateError(null);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      if (reviewingItem.type === 'student') {
        const res = await updateStudentRegistrationReview(
          reviewingItem.id,
          reviewingItem.status,
          reviewingItem.notes
        );
        if (!res.success) throw new Error(res.error);
        setStudents((prev) =>
          prev.map((s) =>
            s.id === reviewingItem.id
              ? { ...s, status: reviewingItem.status, admin_notes: reviewingItem.notes }
              : s
          )
        );
      } else if (reviewingItem.type === 'employer') {
        const res = await updateEmployerRegistrationReview(
          reviewingItem.id,
          reviewingItem.status,
          reviewingItem.notes
        );
        if (!res.success) throw new Error(res.error);
        setEmployers((prev) =>
          prev.map((emp) =>
            emp.id === reviewingItem.id
              ? { ...emp, status: reviewingItem.status, admin_notes: reviewingItem.notes }
              : emp
          )
        );
      } else {
        const res = await updateCollegeRegistrationReview(
          reviewingItem.id,
          reviewingItem.status,
          reviewingItem.notes
        );
        if (!res.success) throw new Error(res.error);
        setColleges((prev) =>
          prev.map((col) =>
            col.id === reviewingItem.id
              ? { ...col, status: reviewingItem.status, admin_notes: reviewingItem.notes }
              : col
          )
        );
      }

      setReviewingItem(null);
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to save review changes.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadStudentResume = async (studentId: string) => {
    setDownloadingId(studentId);
    try {
      const res = await getSecureStudentResumeDownloadUrlAction(studentId);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert(res.error || 'Failed to download resume file.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error retrieving document.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Filtered datasets
  const filteredStudents = students.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesQuery =
      searchQuery === '' ||
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredEmployers = employers.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesQuery =
      searchQuery === '' ||
      e.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.business_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredColleges = colleges.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesQuery =
      searchQuery === '' ||
      c.institution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.official_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Registration Workflows & Stakeholder Submissions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, verify, and triage student profiles, prospective employers, and academic institutions.
          </p>
        </div>
      </div>

      {/* Stakeholder Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students & Freshers</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/20">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('employers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            activeTab === 'employers'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Employers & Recruiters</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/20">
            {employers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('colleges')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            activeTab === 'colleges'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Colleges & Institutions</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/20">
            {colleges.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by name, email, institution, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* TAB 1: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center">
              <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No student registrations found matching your criteria.
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {student.full_name}
                      </h3>
                      {getStatusBadge(student.status)}
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {student.experience_status === 'fresher' ? 'Fresher' : `${student.experience_years} yrs exp`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {student.course} ({student.specialization}) • {student.college_name} • Grad: {student.graduation_year}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {student.resume_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === student.id}
                        onClick={() => handleDownloadStudentResume(student.id)}
                        className="text-xs gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {downloadingId === student.id ? 'Loading...' : 'Resume PDF'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleOpenReview('student', student)}
                      className="text-xs gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review / Triage
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Contact:</span>
                    <span className="font-medium">{student.email} • {student.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Location:</span>
                    <span className="font-medium">{student.city}, {student.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Registered:</span>
                    <span className="font-medium">
                      {new Date(student.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {student.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-slate-400 mr-1">Skills:</span>
                    {student.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {student.admin_notes && (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Private Admin Notes:</span> {student.admin_notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: EMPLOYERS */}
      {activeTab === 'employers' && (
        <div className="space-y-4">
          {filteredEmployers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No employer registrations found matching your criteria.
              </p>
            </div>
          ) : (
            filteredEmployers.map((emp) => (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {emp.company_name}
                      </h3>
                      {getStatusBadge(emp.status)}
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {emp.industry}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Contact: {emp.contact_person} ({emp.designation}) • {emp.office_location}
                      {emp.website && (
                        <a
                          href={emp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 ml-2 hover:underline inline-flex items-center gap-0.5"
                        >
                          website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenReview('employer', emp)}
                    className="text-xs gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review & Notes
                  </Button>
                </div>

                <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2">
                  <div>
                    <span className="text-slate-400 font-semibold block">Hiring Needs:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{emp.hiring_needs}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-400">Business Email:</span>{' '}
                      <span className="font-medium">{emp.business_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span>{' '}
                      <span className="font-medium">{emp.phone}</span>
                    </div>
                    {emp.hiring_volume && (
                      <div>
                        <span className="text-slate-400">Volume:</span>{' '}
                        <span className="font-medium">{emp.hiring_volume}</span>
                      </div>
                    )}
                  </div>
                </div>

                {emp.admin_notes && (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Private Admin Notes:</span> {emp.admin_notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COLLEGES */}
      {activeTab === 'colleges' && (
        <div className="space-y-4">
          {filteredColleges.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center">
              <School className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No institution registrations found matching your criteria.
              </p>
            </div>
          ) : (
            filteredColleges.map((col) => (
              <div
                key={col.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {col.institution_name}
                      </h3>
                      {getStatusBadge(col.status)}
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {col.institution_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Representative: {col.contact_person} ({col.designation}) • {col.city}, {col.state}
                      {col.website && (
                        <a
                          href={col.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-600 ml-2 hover:underline inline-flex items-center gap-0.5"
                        >
                          website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenReview('college', col)}
                    className="text-xs gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review & Notes
                  </Button>
                </div>

                <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2">
                  <div>
                    <span className="text-slate-400 font-semibold block">Placement Cell Details:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{col.placement_cell_details}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-400">Official Email:</span>{' '}
                      <span className="font-medium">{col.official_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span>{' '}
                      <span className="font-medium">{col.phone}</span>
                    </div>
                    {col.student_strength && (
                      <div>
                        <span className="text-slate-400">Batch Size:</span>{' '}
                        <span className="font-medium">{col.student_strength}</span>
                      </div>
                    )}
                  </div>
                </div>

                {col.admin_notes && (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Private Admin Notes:</span> {col.admin_notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Dialog */}
      {reviewingItem && (
        <Dialog
          isOpen={Boolean(reviewingItem)}
          onClose={() => setReviewingItem(null)}
          title={`Review Submission: ${reviewingItem.name}`}
        >
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Review Submission: {reviewingItem.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Stakeholder Type: <span className="uppercase font-semibold">{reviewingItem.type}</span>
              </p>
            </div>

            {updateError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Update Review Status
                </label>
                <select
                  value={reviewingItem.status}
                  onChange={(e) =>
                    setReviewingItem((prev) =>
                      prev ? { ...prev, status: e.target.value as RegistrationStatus } : null
                    )
                  }
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                >
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Reviewed & Verified</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Internal Administrative Notes (Private)
                </label>
                <Textarea
                  rows={4}
                  placeholder="Record internal evaluation remarks, follow-up calls, verification checks, or reasons for status change..."
                  value={reviewingItem.notes}
                  onChange={(e) =>
                    setReviewingItem((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                  }
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Private to administrators. Never displayed on public candidate/employer screens.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewingItem(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Review'}
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  );
}
