import { describe, it, expect, beforeEach } from 'vitest';
import {
  studentRegistrationSchema,
  employerRegistrationSchema,
  collegeRegistrationSchema,
} from '@/lib/validations/registration';
import {
  submitStudentRegistration,
  submitEmployerRegistration,
  submitCollegeRegistration,
  updateStudentRegistrationReview,
  updateEmployerRegistrationReview,
  updateCollegeRegistrationReview,
} from '@/app/actions/registration-actions';
import {
  resetMockStudentRegistrations,
  resetMockEmployerRegistrations,
  resetMockCollegeRegistrations,
  getMockStudentRegistrations,
  getMockEmployerRegistrations,
  getMockCollegeRegistrations,
} from '@/lib/data/mock-data';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/admin-auth';

describe('Registration Validation Schemas', () => {
  describe('studentRegistrationSchema', () => {
    it('validates a complete student/fresher registration payload', () => {
      const payload = {
        full_name: 'Rahul Varma',
        email: 'rahul.varma@example.com',
        phone: '+91 98765 43210',
        city: 'Bengaluru',
        state: 'Karnataka',
        college_name: 'BMS College of Engineering',
        course: 'B.Tech',
        specialization: 'Information Science',
        graduation_year: 2026,
        skills: ['TypeScript', 'React', 'SQL'],
        experience_status: 'fresher',
        experience_years: 0,
        opportunity_interests: ['jobs', 'internships'],
        preferred_locations: ['Bengaluru', 'Remote'],
        consent: true,
      };

      const result = studentRegistrationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.full_name).toBe('Rahul Varma');
        expect(result.data.skills).toEqual(['TypeScript', 'React', 'SQL']);
      }
    });

    it('rejects submissions with missing consent', () => {
      const payload = {
        full_name: 'Rahul Varma',
        email: 'rahul.varma@example.com',
        phone: '+91 98765 43210',
        city: 'Bengaluru',
        state: 'Karnataka',
        college_name: 'BMS College of Engineering',
        course: 'B.Tech',
        specialization: 'Information Science',
        graduation_year: 2026,
        skills: ['TypeScript'],
        experience_status: 'fresher',
        experience_years: 0,
        opportunity_interests: ['jobs'],
        consent: false,
      };

      const result = studentRegistrationSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects submissions if honeypot is filled by bot', () => {
      const payload = {
        full_name: 'Spam Bot',
        email: 'bot@spam.com',
        phone: '+91 98765 43210',
        city: 'Bengaluru',
        state: 'Karnataka',
        college_name: 'Bot College',
        course: 'B.Tech',
        specialization: 'CS',
        graduation_year: 2026,
        skills: ['Python'],
        experience_status: 'fresher',
        opportunity_interests: ['jobs'],
        consent: true,
        website_hp: 'http://spam-link.ru',
      };

      const result = studentRegistrationSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('employerRegistrationSchema', () => {
    it('validates a valid corporate employer registration', () => {
      const payload = {
        company_name: 'Apex Software Solutions',
        contact_person: 'Deepika Sen',
        business_email: 'deepika.sen@apexsolutions.com',
        phone: '+91 98450 12345',
        designation: 'Talent Acquisition Partner',
        website: 'https://apexsolutions.com',
        industry: 'FinTech & Payments',
        office_location: 'Bengaluru, Karnataka',
        hiring_needs: 'We are expanding our payments infrastructure team and hiring 10 backend engineers.',
        opportunity_types: ['full-time', 'internship'],
        hiring_volume: '10-15 hires',
        collaboration_interests: ['campus_hiring'],
        consent: true,
      };

      const result = employerRegistrationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects short hiring needs description (< 10 chars)', () => {
      const payload = {
        company_name: 'Apex Software Solutions',
        contact_person: 'Deepika Sen',
        business_email: 'deepika.sen@apexsolutions.com',
        phone: '+91 98450 12345',
        designation: 'Recruiter',
        industry: 'IT',
        office_location: 'Bengaluru',
        hiring_needs: 'Jobs', // too short
        opportunity_types: ['full-time'],
        consent: true,
      };

      const result = employerRegistrationSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('collegeRegistrationSchema', () => {
    it('validates a valid college/institution registration', () => {
      const payload = {
        institution_name: 'Ramaiah Institute of Technology',
        institution_type: 'Engineering & Technology College',
        official_email: 'placements@msrit.edu',
        contact_person: 'Prof. K. Swamy',
        designation: 'Head of Placements',
        phone: '+91 80 2360 0822',
        city: 'Bengaluru',
        state: 'Karnataka',
        website: 'https://www.msrit.edu',
        courses_departments: ['CSE', 'ECE', 'ISE'],
        student_strength: '1500 students',
        placement_cell_details: 'Central training and placement division facilitating annual private campus drives.',
        collaboration_interests: ['campus_placements', 'skill_workshops'],
        consent: true,
      };

      const result = collegeRegistrationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});

describe('Registration Server Actions and Admin Workflows', () => {
  beforeEach(() => {
    resetMockStudentRegistrations();
    resetMockEmployerRegistrations();
    resetMockCollegeRegistrations();
  });

  it('submits a student registration and stores it in pending status', async () => {
    const formData = new FormData();
    formData.set('full_name', 'Pooja Hegde');
    formData.set('email', 'pooja.hegde@example.com');
    formData.set('phone', '+91 91234 56789');
    formData.set('city', 'Mysuru');
    formData.set('state', 'Karnataka');
    formData.set('college_name', 'National Institute of Engineering');
    formData.set('course', 'B.E.');
    formData.set('specialization', 'Computer Science');
    formData.set('graduation_year', '2026');
    formData.append('skills', 'JavaScript');
    formData.append('skills', 'Python');
    formData.set('experience_status', 'fresher');
    formData.set('experience_years', '0');
    formData.append('opportunity_interests', 'jobs');
    formData.append('opportunity_interests', 'internships');
    formData.set('consent', 'true');

    const res = await submitStudentRegistration(formData);
    expect(res.success).toBe(true);
    expect(res.referenceId).toBeDefined();

    const currentStudents = getMockStudentRegistrations();
    const created = currentStudents.find((s) => s.email === 'pooja.hegde@example.com');
    expect(created).toBeDefined();
    expect(created?.status).toBe('pending');
  });

  it('submits an employer registration and assigns pending status', async () => {
    const formData = new FormData();
    formData.set('company_name', 'Zenith AI Labs');
    formData.set('contact_person', 'Arun Nair');
    formData.set('business_email', 'arun.nair@zenithailabs.com');
    formData.set('phone', '+91 98888 77777');
    formData.set('designation', 'Director of Engineering');
    formData.set('industry', 'Artificial Intelligence');
    formData.set('office_location', 'Bengaluru, Karnataka');
    formData.set('hiring_needs', 'Seeking machine learning engineers and full-stack developers for our AI lab.');
    formData.append('opportunity_types', 'full-time');
    formData.set('consent', 'true');

    const res = await submitEmployerRegistration(formData);
    expect(res.success).toBe(true);

    const employers = getMockEmployerRegistrations();
    const created = employers.find((e) => e.business_email === 'arun.nair@zenithailabs.com');
    expect(created).toBeDefined();
    expect(created?.status).toBe('pending');
  });

  it('submits a college registration and assigns pending status', async () => {
    const formData = new FormData();
    formData.set('institution_name', 'PES University');
    formData.set('institution_type', 'University');
    formData.set('official_email', 'placements@pes.edu');
    formData.set('contact_person', 'Dr. V. Rao');
    formData.set('designation', 'Director Placement');
    formData.set('phone', '+91 80 2672 1983');
    formData.set('city', 'Bengaluru');
    formData.set('state', 'Karnataka');
    formData.set('placement_cell_details', 'Top tier university placement department organizing technical recruitment.');
    formData.append('collaboration_interests', 'campus_placements');
    formData.set('consent', 'true');

    const res = await submitCollegeRegistration(formData);
    expect(res.success).toBe(true);

    const colleges = getMockCollegeRegistrations();
    const created = colleges.find((c) => c.official_email === 'placements@pes.edu');
    expect(created).toBeDefined();
    expect(created?.status).toBe('pending');
  });

  it('updates review status and private notes with admin authentication', async () => {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, 'admin@akshithaedutech.com');

    const mockStudents = getMockStudentRegistrations();
    const targetStudent = mockStudents[0];

    const updateRes = await updateStudentRegistrationReview(
      targetStudent.id,
      'approved',
      'Verified academic credentials and candidate portfolio.'
    );

    expect(updateRes.success).toBe(true);
    const updated = getMockStudentRegistrations().find((s) => s.id === targetStudent.id);
    expect(updated?.status).toBe('approved');
    expect(updated?.admin_notes).toBe('Verified academic credentials and candidate portfolio.');

    // Employer review test
    const targetEmployer = getMockEmployerRegistrations()[0];
    const empRes = await updateEmployerRegistrationReview(
      targetEmployer.id,
      'reviewed',
      'Verified corporate entity and hiring manager identity.'
    );
    expect(empRes.success).toBe(true);
    const updatedEmp = getMockEmployerRegistrations().find((e) => e.id === targetEmployer.id);
    expect(updatedEmp?.status).toBe('reviewed');

    // College review test
    const targetCollege = getMockCollegeRegistrations()[0];
    const colRes = await updateCollegeRegistrationReview(
      targetCollege.id,
      'approved',
      'Confirmed institutional placement officer details.'
    );
    expect(colRes.success).toBe(true);
    const updatedCol = getMockCollegeRegistrations().find((c) => c.id === targetCollege.id);
    expect(updatedCol?.status).toBe('approved');
  });
});
