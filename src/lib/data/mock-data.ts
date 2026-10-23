import {
  Job,
  CareerResource,
  CompanySettings,
  AdminProfile,
  Application,
  Enquiry,
  JobReport,
  StudentRegistration,
  EmployerRegistration,
  CollegeRegistration,
} from '@/types/database';

export const MOCK_COMPANY_SETTINGS: CompanySettings = {
  id: 'c0000000-0000-0000-0000-000000000001',
  company_name: 'Akshitha Edutech Private Limited',
  tagline: 'Connecting Aspirants with Curated Private-Sector Opportunities',
  contact_email: 'careers@akshithaedutech.com',
  contact_phone: '+91 80 4123 4567',
  office_address: 'Tech Innovation Park, Outer Ring Road, Bengaluru, Karnataka 560100, India',
  social_links: {
    linkedin: 'https://linkedin.com/company/akshitha-edutech',
    twitter: 'https://x.com/akshithaedutech',
    facebook: 'https://facebook.com/akshithaedutech',
  },
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const MOCK_JOBS: Job[] = [
  {
    id: 'a0000000-0000-4000-a000-000000000001',
    slug: 'graduate-trainee-software-engineer',
    title: 'Graduate Trainee - Software Engineer',
    company_name: 'Akshitha Edutech Private Limited',
    location: 'Bengaluru, Karnataka',
    work_mode: 'hybrid',
    employment_type: 'full-time',
    category: 'Engineering',
    description:
      'We are seeking high-potential fresh engineering graduates to join our product engineering team. You will undergo structured mentorship while writing modern TypeScript and React code for scalable learning systems.',
    responsibilities: [
      'Build responsive user interfaces using Next.js and TypeScript',
      'Collaborate with senior engineers on REST and PostgreSQL database integrations',
      'Write automated unit tests and participate in active peer code reviews',
      'Troubleshoot and resolve front-end edge cases across desktop and mobile browsers',
    ],
    qualifications: [
      'B.Tech / B.E. / MCA in Computer Science, IT, or related technical disciplines (2025/2026 batch)',
      'Solid foundations in data structures, algorithms, and JavaScript / TypeScript',
      'Familiarity with Git version control and modern web standards',
      'Strong analytical mindset and enthusiasm for educational technology',
    ],
    experience_min: 0,
    experience_max: 1,
    salary_min: 450000,
    salary_max: 650000,
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML/CSS', 'Git'],
    openings: 5,
    application_deadline: '2026-12-31T23:59:59Z',
    application_instructions: 'Direct application. Attach your PDF resume highlighting academic projects or internship experience.',
    status: 'published',
    featured: true,
    published_at: '2026-10-20T10:00:00Z',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000002',
    slug: 'senior-full-stack-developer',
    title: 'Senior Full-Stack Developer',
    company_name: 'Akshitha Edutech Private Limited',
    location: 'Remote (India)',
    work_mode: 'remote',
    employment_type: 'full-time',
    category: 'Engineering',
    description:
      'Join us as a Senior Full-Stack Developer leading architectural decisions across our educational technology platforms. You will design robust APIs, optimize database queries, and mentor early-career engineers.',
    responsibilities: [
      'Architect high-throughput Next.js and Node.js microservices',
      'Design and optimize PostgreSQL schemas, indexes, and queries',
      'Maintain security standards, role-based access, and robust CI/CD pipelines',
      'Mentor graduate trainees and conduct technical architecture reviews',
    ],
    qualifications: [
      '3+ years of professional full-stack software engineering experience',
      'Strong production experience with Next.js App Router, TypeScript, and PostgreSQL / Supabase',
      'Proven track record of designing scalable database schemas and private storage architectures',
    ],
    experience_min: 3,
    experience_max: 7,
    salary_min: 1400000,
    salary_max: 2200000,
    skills: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'REST APIs'],
    openings: 2,
    application_deadline: '2026-12-15T23:59:59Z',
    application_instructions: 'Direct application. Please attach a PDF resume with links to production GitHub repositories or live apps.',
    status: 'published',
    featured: true,
    published_at: '2026-10-18T09:00:00Z',
    created_at: '2026-10-18T09:00:00Z',
    updated_at: '2026-10-18T09:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000003',
    slug: 'associate-career-counselor',
    title: 'Associate Career Counselor',
    company_name: 'Akshitha Edutech Private Limited',
    location: 'Hyderabad, Telangana',
    work_mode: 'on-site',
    employment_type: 'full-time',
    category: 'Student Advisory',
    description:
      'Work directly with college students and fresh graduates to provide guidance on private-sector career pathways, resume building, and interview preparation.',
    responsibilities: [
      'Conduct 1-on-1 career guidance sessions with enrolled candidates',
      'Help candidates identify skill gaps and align with suitable job openings',
      'Coordinate with regional corporate hiring partners for interview scheduling',
    ],
    qualifications: [
      'Bachelor degree with exceptional verbal and written English communication',
      'High empathy, active listening, and problem-solving abilities',
      'Prior student council, training, or counseling experience is a strong plus',
    ],
    experience_min: 0,
    experience_max: 2,
    salary_min: 350000,
    salary_max: 500000,
    skills: ['Career Counseling', 'Communication', 'Student Guidance', 'Interview Coaching'],
    openings: 3,
    application_deadline: '2026-11-30T23:59:59Z',
    application_instructions: 'Direct application with PDF resume.',
    status: 'published',
    featured: false,
    published_at: '2026-10-21T11:00:00Z',
    created_at: '2026-10-21T11:00:00Z',
    updated_at: '2026-10-21T11:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000004',
    slug: 'junior-content-curator-freshers',
    title: 'Junior Content Curator (Freshers Welcome)',
    company_name: 'Akshitha Edutech Private Limited',
    location: 'Chennai, Tamil Nadu',
    work_mode: 'hybrid',
    employment_type: 'full-time',
    category: 'Education & Content',
    description:
      'Review, research, and curate technical learning modules and assessments designed for campus placements and lateral entry examinations.',
    responsibilities: [
      'Curate and format practice questions, technical guides, and problem statements',
      'Ensure accuracy of answer explanations and domain learning materials',
      'Collaborate with subject matter experts to update curriculum modules',
    ],
    qualifications: [
      'Bachelor degree in Science, Engineering, or Humanities with strong writing skills',
      'Keen attention to detail and ability to research complex technical topics',
      'Proficiency in Markdown and word processing tools',
    ],
    experience_min: 0,
    experience_max: 1,
    salary_min: 320000,
    salary_max: 420000,
    skills: ['Content Writing', 'Curriculum Design', 'Proofreading', 'Markdown'],
    openings: 2,
    application_deadline: '2026-12-20T23:59:59Z',
    application_instructions: 'Submit PDF resume with a short sample of technical writing or project summary.',
    status: 'published',
    featured: false,
    published_at: '2026-10-22T08:00:00Z',
    created_at: '2026-10-22T08:00:00Z',
    updated_at: '2026-10-22T08:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000005',
    slug: 'lead-ui-ux-designer-draft',
    title: 'Lead UI/UX Designer (Internal Draft)',
    company_name: 'Akshitha Edutech Private Limited',
    location: 'Bengaluru, Karnataka',
    work_mode: 'hybrid',
    employment_type: 'full-time',
    category: 'Design',
    description: 'Internal draft role under leadership review. MUST NOT be displayed to public visitors.',
    responsibilities: ['Design design system tokens'],
    qualifications: ['5+ years UI/UX'],
    experience_min: 5,
    experience_max: 10,
    salary_min: 1600000,
    salary_max: 2400000,
    skills: ['Figma', 'UI/UX'],
    openings: 1,
    application_deadline: '2026-12-31T23:59:59Z',
    application_instructions: null,
    status: 'draft', // DRAFT: Must never appear publicly!
    featured: false,
    published_at: null,
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000006',
    slug: 'operations-associate-closed',
    title: 'Operations Associate (Closed)',
    company_name: 'Akshitha Edutech Private Limited',
    location: 'Chennai, Tamil Nadu',
    work_mode: 'on-site',
    employment_type: 'full-time',
    category: 'Operations',
    description: 'This listing is closed and preserved for audit history.',
    responsibilities: ['Operations'],
    qualifications: ['1+ years'],
    experience_min: 1,
    experience_max: 3,
    salary_min: 400000,
    salary_max: 550000,
    skills: ['Operations'],
    openings: 1,
    application_deadline: '2026-10-01T00:00:00Z', // Expired
    application_instructions: null,
    status: 'closed', // CLOSED: Must never appear in active listings!
    featured: false,
    published_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
];

export const MOCK_CAREER_RESOURCES: CareerResource[] = [
  {
    id: 'b0000000-0000-4000-a000-000000000001',
    slug: 'fresher-resume-guide-2026',
    title: 'How to Craft a Standout Technical Resume as a Fresher in 2026',
    excerpt: 'Key strategies for recent graduates to highlight projects, internships, and core fundamentals effectively without prior corporate experience.',
    content: `## How to Craft a Standout Technical Resume as a Fresher

As a fresh graduate entering the private technology sector, recruiters look for clean formatting, project demonstrations, and strong problem-solving fundamentals.

### 1. Highlight Impact in Academic Projects
Rather than listing generic course titles, describe the exact problem your project solved and the stack used. Example: *"Engineered a real-time collaborative whiteboard using React, TypeScript, and WebSocket, supporting up to 50 concurrent users."*

### 2. Keep Formatting Single-Page and ATS-Friendly
Use clean semantic headings, standard PDF formatting, and avoid complex multi-column tables that confuse automated parsers.

### 3. Emphasize Core Foundations
Be prepared to discuss data structures, algorithmic complexity, database design, and object-oriented principles. Strong fundamentals always outweigh surface-level familiarity with dozens of tools.`,
    category: 'Resume Tips',
    status: 'published',
    published_at: '2026-10-15T10:00:00Z',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'b0000000-0000-4000-a000-000000000002',
    slug: 'mastering-first-round-technical-interviews',
    title: 'Mastering Your First-Round Technical Interview',
    excerpt: 'A structured approach to technical questions, live coding, and communication for private sector fresher and lateral opportunities.',
    content: `## Mastering Your First-Round Technical Interview

Preparation is the key differentiator in competitive technical interviews.

### 1. Think Out Loud
Interviewers evaluate your thought process more than just the final answer. Clarify constraints, outline brute-force approaches first, then discuss potential optimizations.

### 2. Verify Edge Cases Proactively
Check null inputs, boundary values, empty collections, and extreme scale before stating your solution is complete.

### 3. Ask Thoughtful Questions
Prepare questions about the team's engineering challenges, deployment frequency, and mentorship culture.`,
    category: 'Interview Prep',
    status: 'published',
    published_at: '2026-10-19T14:00:00Z',
    created_at: '2026-10-19T14:00:00Z',
    updated_at: '2026-10-19T14:00:00Z',
  },
];

// ============================================================================
// Phase 5: Admin Mock Data & In-Memory Store
// ============================================================================

export const MOCK_ADMIN_PROFILES: AdminProfile[] = [
  {
    id: 'd0000000-0000-4000-a000-000000000001',
    email: 'admin@akshithaedutech.com',
    full_name: 'Lead Admin (Akshitha Edutech)',
    role: 'super_admin',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-4000-a000-000000000002',
    email: 'editor@akshithaedutech.com',
    full_name: 'Content Editor',
    role: 'editor',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-4000-a000-000000000003',
    email: 'inactive@akshithaedutech.com',
    full_name: 'Former Staff Member',
    role: 'admin',
    is_active: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'e0000000-0000-4000-a000-000000000001',
    job_id: 'a0000000-0000-4000-a000-000000000001', // Graduate Trainee
    candidate_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    city: 'Bengaluru',
    education: 'B.Tech in Computer Science (2025)',
    experience_years: 0,
    cover_letter: 'I am passionate about full-stack web development with React and TypeScript.',
    resume_path: 'resumes/a0000000-0000-4000-a000-000000000001/e0000000-0000-4000-a000-000000000001/resume.pdf',
    resume_original_name: 'Aarav_Sharma_Resume.pdf',
    consent_at: '2026-10-21T08:30:00Z',
    status: 'pending',
    internal_notes: null,
    created_at: '2026-10-21T08:30:00Z',
    updated_at: '2026-10-21T08:30:00Z',
  },
  {
    id: 'e0000000-0000-4000-a000-000000000002',
    job_id: 'a0000000-0000-4000-a000-000000000002', // Senior Full-Stack
    candidate_name: 'Priya Venkatesh',
    email: 'priya.venkatesh@example.com',
    phone: '+91 91234 56789',
    city: 'Hyderabad',
    education: 'M.Tech in Information Technology',
    experience_years: 5,
    cover_letter: 'Experienced Next.js and PostgreSQL engineer with a strong track record of scalable deployments.',
    resume_path: 'resumes/a0000000-0000-4000-a000-000000000002/e0000000-0000-4000-a000-000000000002/resume.pdf',
    resume_original_name: 'Priya_Venkatesh_CV.pdf',
    consent_at: '2026-10-22T11:00:00Z',
    status: 'reviewed',
    internal_notes: 'Strong production credentials. Code samples look promising.',
    created_at: '2026-10-22T11:00:00Z',
    updated_at: '2026-10-22T14:15:00Z',
  },
  {
    id: 'e0000000-0000-4000-a000-000000000003',
    job_id: 'a0000000-0000-4000-a000-000000000001',
    candidate_name: 'Rohan Mehra',
    email: 'rohan.mehra@example.com',
    phone: '+91 99887 76655',
    city: 'Pune',
    education: 'B.E. Information Technology (2025)',
    experience_years: 0,
    cover_letter: 'Eager to contribute and learn in a structured product engineering environment.',
    resume_path: 'resumes/a0000000-0000-4000-a000-000000000001/e0000000-0000-4000-a000-000000000003/resume.pdf',
    resume_original_name: 'Rohan_Mehra_Resume.pdf',
    consent_at: '2026-10-22T16:45:00Z',
    status: 'shortlisted',
    internal_notes: 'Scheduled for round 1 technical interview on Monday.',
    created_at: '2026-10-22T16:45:00Z',
    updated_at: '2026-10-23T09:00:00Z',
  },
];

export const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: 'f0000000-0000-4000-a000-000000000001',
    name: 'Vikram Joshi',
    email: 'vikram.joshi@example.com',
    phone: '+91 97654 32109',
    enquiry_type: 'career_guidance',
    related_job_id: null,
    message: 'Could you provide more guidance on technical expectations for 2026 graduates applying for junior engineering roles?',
    status: 'new',
    internal_notes: null,
    created_at: '2026-10-21T12:00:00Z',
    updated_at: '2026-10-21T12:00:00Z',
  },
  {
    id: 'f0000000-0000-4000-a000-000000000002',
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '+91 98321 09876',
    enquiry_type: 'job_specific',
    related_job_id: 'a0000000-0000-4000-a000-000000000002',
    message: 'Inquiring if the Senior Full-Stack role supports flexible working hours for remote team members.',
    status: 'in_progress',
    internal_notes: 'Replied via email explaining core overlap hours (11am - 4pm IST).',
    created_at: '2026-10-22T14:30:00Z',
    updated_at: '2026-10-22T17:00:00Z',
  },
];

export const MOCK_JOB_REPORTS: JobReport[] = [
  {
    id: 'g0000000-0000-4000-a000-000000000001',
    job_id: 'a0000000-0000-4000-a000-000000000004', // Operations Coordinator (closed)
    reporter_name: 'Kavita Nair',
    reporter_email: 'kavita.nair@example.com',
    reason: 'expired_position',
    details: 'The deadline for this position has passed, but it was visible in a bookmark.',
    status: 'pending',
    created_at: '2026-10-22T10:15:00Z',
    updated_at: '2026-10-22T10:15:00Z',
  },
];

// In-memory collections to support full CRUD mutations in mock/test mode
let activeJobs = [...MOCK_JOBS];
let activeApplications = [...MOCK_APPLICATIONS];
let activeEnquiries = [...MOCK_ENQUIRIES];
let activeReports = [...MOCK_JOB_REPORTS];

export function getMockJobs(): Job[] {
  return activeJobs;
}

export function setMockJobs(jobs: Job[]) {
  activeJobs = jobs;
}

export function resetMockJobs() {
  activeJobs = [...MOCK_JOBS];
}

export function getMockApplications(): Application[] {
  return activeApplications;
}

export function addMockApplication(app: Application) {
  activeApplications.unshift(app);
}

export function updateMockApplication(id: string, updates: Partial<Application>): Application | null {
  const index = activeApplications.findIndex((a) => a.id === id);
  if (index === -1) return null;
  activeApplications[index] = {
    ...activeApplications[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return activeApplications[index];
}

export function resetMockApplications() {
  activeApplications = [...MOCK_APPLICATIONS];
}

export function getMockEnquiries(): Enquiry[] {
  return activeEnquiries;
}

export function updateMockEnquiry(id: string, updates: Partial<Enquiry>): Enquiry | null {
  const index = activeEnquiries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  activeEnquiries[index] = {
    ...activeEnquiries[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return activeEnquiries[index];
}

export function resetMockEnquiries() {
  activeEnquiries = [...MOCK_ENQUIRIES];
}

export function addMockEnquiry(enquiry: Enquiry) {
  activeEnquiries.unshift(enquiry);
}

export function getMockReports(): JobReport[] {
  return activeReports;
}

export function addMockReport(report: JobReport) {
  activeReports.unshift(report);
}

export function updateMockReport(id: string, updates: Partial<JobReport>): JobReport | null {
  const index = activeReports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  activeReports[index] = {
    ...activeReports[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return activeReports[index];
}

export function resetMockReports() {
  activeReports = [...MOCK_JOB_REPORTS];
}

export const MOCK_STUDENT_REGISTRATIONS: StudentRegistration[] = [
  {
    id: 's0000000-0000-4000-a000-000000000001',
    full_name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210',
    city: 'Bengaluru',
    state: 'Karnataka',
    college_name: 'RV College of Engineering',
    course: 'B.Tech',
    specialization: 'Computer Science',
    graduation_year: 2026,
    skills: ['Python', 'Django', 'React', 'SQL'],
    experience_status: 'fresher',
    experience_years: 0,
    opportunity_interests: ['jobs', 'internships', 'skill_development'],
    preferred_locations: ['Bengaluru', 'Hyderabad'],
    resume_path: null,
    resume_original_name: null,
    status: 'pending',
    admin_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    consent_at: '2026-03-01T10:00:00Z',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
];

export const MOCK_EMPLOYER_REGISTRATIONS: EmployerRegistration[] = [
  {
    id: 'e0000000-0000-4000-a000-000000000001',
    company_name: 'NextGen Cloud Systems Pvt Ltd',
    contact_person: 'Vikramaditya Roy',
    business_email: 'vikram.roy@nextgencloud.io',
    phone: '+91 98111 22233',
    designation: 'Head of Talent Acquisition',
    website: 'https://nextgencloud.io',
    industry: 'Cloud Infrastructure & DevOps',
    office_location: 'Hyderabad, Telangana',
    hiring_needs: 'Seeking 15-20 entry-level and junior cloud associate engineers with AWS/Linux skills.',
    opportunity_types: ['full-time', 'internship'],
    hiring_volume: '15-20 candidates',
    collaboration_interests: ['campus_hiring', 'internships'],
    status: 'pending',
    admin_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    consent_at: '2026-03-05T14:30:00Z',
    created_at: '2026-03-05T14:30:00Z',
    updated_at: '2026-03-05T14:30:00Z',
  },
];

export const MOCK_COLLEGE_REGISTRATIONS: CollegeRegistration[] = [
  {
    id: 'u0000000-0000-4000-a000-000000000001',
    institution_name: 'National Institute of Technology Karnataka, Surathkal',
    institution_type: 'Engineering & Technology Institute',
    official_email: 'placements@nitk.edu.in',
    contact_person: 'Dr. Ramesh Kumar',
    designation: 'Professor & Head of Training and Placements',
    phone: '+91 824 2474000',
    city: 'Mangaluru',
    state: 'Karnataka',
    website: 'https://www.nitk.ac.in',
    courses_departments: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical'],
    student_strength: '1200+ graduating students',
    placement_cell_details: 'Active central placement cell conducting annual campus drives for private-sector recruiters.',
    collaboration_interests: ['campus_placements', 'internship_drives', 'skill_workshops'],
    status: 'pending',
    admin_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    consent_at: '2026-03-08T11:15:00Z',
    created_at: '2026-03-08T11:15:00Z',
    updated_at: '2026-03-08T11:15:00Z',
  },
];

let activeStudentRegistrations = [...MOCK_STUDENT_REGISTRATIONS];
let activeEmployerRegistrations = [...MOCK_EMPLOYER_REGISTRATIONS];
let activeCollegeRegistrations = [...MOCK_COLLEGE_REGISTRATIONS];

export function getMockStudentRegistrations(): StudentRegistration[] {
  return activeStudentRegistrations;
}

export function addMockStudentRegistration(reg: StudentRegistration) {
  activeStudentRegistrations.unshift(reg);
}

export function updateMockStudentRegistration(id: string, updates: Partial<StudentRegistration>): StudentRegistration | null {
  const index = activeStudentRegistrations.findIndex((r) => r.id === id);
  if (index === -1) return null;
  activeStudentRegistrations[index] = {
    ...activeStudentRegistrations[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return activeStudentRegistrations[index];
}

export function resetMockStudentRegistrations() {
  activeStudentRegistrations = [...MOCK_STUDENT_REGISTRATIONS];
}

export function getMockEmployerRegistrations(): EmployerRegistration[] {
  return activeEmployerRegistrations;
}

export function addMockEmployerRegistration(reg: EmployerRegistration) {
  activeEmployerRegistrations.unshift(reg);
}

export function updateMockEmployerRegistration(id: string, updates: Partial<EmployerRegistration>): EmployerRegistration | null {
  const index = activeEmployerRegistrations.findIndex((r) => r.id === id);
  if (index === -1) return null;
  activeEmployerRegistrations[index] = {
    ...activeEmployerRegistrations[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return activeEmployerRegistrations[index];
}

export function resetMockEmployerRegistrations() {
  activeEmployerRegistrations = [...MOCK_EMPLOYER_REGISTRATIONS];
}

export function getMockCollegeRegistrations(): CollegeRegistration[] {
  return activeCollegeRegistrations;
}

export function addMockCollegeRegistration(reg: CollegeRegistration) {
  activeCollegeRegistrations.unshift(reg);
}

export function updateMockCollegeRegistration(id: string, updates: Partial<CollegeRegistration>): CollegeRegistration | null {
  const index = activeCollegeRegistrations.findIndex((r) => r.id === id);
  if (index === -1) return null;
  activeCollegeRegistrations[index] = {
    ...activeCollegeRegistrations[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return activeCollegeRegistrations[index];
}

export function resetMockCollegeRegistrations() {
  activeCollegeRegistrations = [...MOCK_COLLEGE_REGISTRATIONS];
}


