-- ============================================================================
-- Akshitha Edutech Private Limited — Development Seed Data
-- File: supabase/seed.sql
-- NOTICE: FOR LOCAL AND STAGING DEVELOPMENT ONLY. DO NOT RUN IN PRODUCTION.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Company Settings
-- ----------------------------------------------------------------------------
INSERT INTO public.company_settings (
  company_name,
  tagline,
  contact_email,
  contact_phone,
  office_address,
  social_links
) VALUES (
  'Akshitha Edutech Private Limited',
  'Empowering careers through curated private-sector employment opportunities',
  'careers@akshithaedutech.com',
  '+91 80 4123 4567',
  'Tech Innovation Park, Bengaluru, Karnataka 560100, India',
  '{"linkedin": "https://linkedin.com/company/akshitha-edutech", "twitter": "https://x.com/akshithaedutech"}'::jsonb
) ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Mock Jobs (Freshers & Experienced, Published & Draft & Closed)
-- ----------------------------------------------------------------------------
-- Job 1: Published Fresher Engineering
INSERT INTO public.jobs (
  id,
  slug,
  title,
  company_name,
  location,
  work_mode,
  employment_type,
  category,
  description,
  responsibilities,
  qualifications,
  experience_min,
  experience_max,
  salary_min,
  salary_max,
  skills,
  openings,
  application_deadline,
  application_instructions,
  status,
  featured,
  published_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'graduate-trainee-software-engineer',
  'Graduate Trainee - Software Engineer',
  'Akshitha Edutech Private Limited',
  'Bengaluru, Karnataka',
  'hybrid',
  'full-time',
  'Engineering',
  'We are seeking high-potential fresh engineering graduates to join our product engineering team. You will undergo structured mentorship while writing modern TypeScript and React code for scalable learning systems.',
  ARRAY['Build responsive user interfaces using Next.js and TypeScript', 'Collaborate with senior engineers on REST and PostgreSQL database integrations', 'Write automated unit tests and participate in code reviews'],
  ARRAY['B.Tech / B.E. / MCA in Computer Science or related disciplines (2025/2026 batch)', 'Solid foundations in data structures, algorithms, and JavaScript', 'Familiarity with Git and modern web standards'],
  0,
  1,
  450000.00,
  650000.00,
  ARRAY['JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'Git'],
  5,
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  'Submit your PDF resume highlighting academic projects or internship experience.',
  'published',
  true,
  CURRENT_TIMESTAMP - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Job 2: Published Experienced Role
INSERT INTO public.jobs (
  id,
  slug,
  title,
  company_name,
  location,
  work_mode,
  employment_type,
  category,
  description,
  responsibilities,
  qualifications,
  experience_min,
  experience_max,
  salary_min,
  salary_max,
  skills,
  openings,
  application_deadline,
  application_instructions,
  status,
  featured,
  published_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'senior-full-stack-developer',
  'Senior Full-Stack Developer',
  'Akshitha Edutech Private Limited',
  'Remote (India)',
  'remote',
  'full-time',
  'Engineering',
  'Join us as a Senior Full-Stack Developer leading architectural decisions across our educational technology platforms. You will design robust APIs, optimize database queries, and mentor early-career engineers.',
  ARRAY['Architect high-throughput Next.js and Node.js microservices', 'Design and optimize PostgreSQL schemas, indexes, and queries', 'Maintain security standards and robust CI/CD deployment pipelines'],
  ARRAY['4+ years professional software engineering experience', 'Strong production experience with Next.js App Router, TypeScript, and Supabase / PostgreSQL', 'Proven track record of building and scaling web applications'],
  3,
  7,
  1400000.00,
  2200000.00,
  ARRAY['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
  2,
  CURRENT_TIMESTAMP + INTERVAL '45 days',
  'Attach your PDF resume and include links to your GitHub or notable production projects.',
  'published',
  true,
  CURRENT_TIMESTAMP - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Job 3: Published Academic / Counseling Fresher Role
INSERT INTO public.jobs (
  id,
  slug,
  title,
  company_name,
  location,
  work_mode,
  employment_type,
  category,
  description,
  responsibilities,
  qualifications,
  experience_min,
  experience_max,
  salary_min,
  salary_max,
  skills,
  openings,
  application_deadline,
  application_instructions,
  status,
  featured,
  published_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'associate-career-counselor',
  'Associate Career Counselor',
  'Akshitha Edutech Private Limited',
  'Hyderabad, Telangana',
  'on-site',
  'full-time',
  'Student Advisory',
  'Work directly with college students and fresh graduates to provide guidance on private-sector career pathways, resume building, and interview preparation.',
  ARRAY['Conduct 1-on-1 career guidance sessions with enrolled candidates', 'Help candidates identify skill gaps and align with suitable job openings', 'Coordinate with hiring partners for interview scheduling'],
  ARRAY['Any Bachelor degree with exceptional verbal and written English communication', 'High empathy, active listening, and problem-solving abilities', 'Prior student council or counseling experience is a plus'],
  0,
  2,
  350000.00,
  500000.00,
  ARRAY['Career Counseling', 'Communication', 'Student Guidance', 'MS Excel'],
  3,
  CURRENT_TIMESTAMP + INTERVAL '20 days',
  'Direct application with PDF resume.',
  'published',
  false,
  CURRENT_TIMESTAMP - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- Job 4: Draft Role (Admin testing only - MUST NOT appear to public)
INSERT INTO public.jobs (
  id,
  slug,
  title,
  company_name,
  location,
  work_mode,
  employment_type,
  category,
  description,
  responsibilities,
  qualifications,
  experience_min,
  experience_max,
  salary_min,
  salary_max,
  skills,
  openings,
  application_deadline,
  status,
  featured
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'lead-ui-ux-designer-draft',
  'Lead UI/UX Designer (Internal Draft)',
  'Akshitha Edutech Private Limited',
  'Bengaluru, Karnataka',
  'hybrid',
  'full-time',
  'Design',
  'Internal draft listing for product design lead. Under review by leadership team.',
  ARRAY['Design responsive, accessible user interfaces in Figma', 'Conduct user research and usability testing'],
  ARRAY['5+ years in product design and design systems'],
  5,
  10,
  1600000.00,
  2400000.00,
  ARRAY['Figma', 'UI Design', 'Design Systems'],
  1,
  CURRENT_TIMESTAMP + INTERVAL '60 days',
  'draft',
  false
) ON CONFLICT (id) DO NOTHING;

-- Job 5: Closed Role (Testing expired/closed preservation)
INSERT INTO public.jobs (
  id,
  slug,
  title,
  company_name,
  location,
  work_mode,
  employment_type,
  category,
  description,
  responsibilities,
  qualifications,
  experience_min,
  experience_max,
  salary_min,
  salary_max,
  skills,
  openings,
  application_deadline,
  status,
  featured,
  published_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'associate-operations-executive-closed',
  'Associate Operations Executive',
  'Akshitha Edutech Private Limited',
  'Chennai, Tamil Nadu',
  'on-site',
  'full-time',
  'Operations',
  'Position filled. Listing closed and archived for record keeping.',
  ARRAY['Operational coordination with regional hiring partners'],
  ARRAY['Bachelor degree with strong analytical skills'],
  1,
  3,
  400000.00,
  550000.00,
  ARRAY['Operations', 'Reporting', 'Vendor Management'],
  1,
  CURRENT_TIMESTAMP - INTERVAL '10 days',
  'closed',
  false,
  CURRENT_TIMESTAMP - INTERVAL '40 days'
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Career Resources (Published articles for public candidate portal)
-- ----------------------------------------------------------------------------
INSERT INTO public.career_resources (
  id,
  slug,
  title,
  excerpt,
  content,
  category,
  status,
  published_at
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'fresher-resume-guide-2026',
  'How to Craft a Standout Technical Resume as a Fresher in 2026',
  'Key strategies for recent graduates to highlight projects, internships, and core fundamentals effectively.',
  '# How to Craft a Standout Technical Resume\n\nAs a fresher entering the private technology sector, recruiters look for clean formatting, project demonstrations, and strong problem-solving fundamentals.\n\n### 1. Highlight Impact in Academic Projects\nRather than listing general coursework, describe the problem your project solved and the stack used.\n\n### 2. Keep formatting single-page and ATS-friendly\nUse simple headings, standard PDF format, and avoid nested multi-column layouts that confuse automated parsers.',
  'Resume Tips',
  'published',
  CURRENT_TIMESTAMP - INTERVAL '7 days'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'mastering-first-round-technical-interviews',
  'Mastering Your First-Round Technical Interview',
  'A structured approach to behavioral and fundamental programming questions for private sector roles.',
  '# Mastering Your First-Round Technical Interview\n\nPreparation is the key differentiator. Learn how to communicate your reasoning clearly when working through live code challenges.',
  'Interview Prep',
  'published',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;
