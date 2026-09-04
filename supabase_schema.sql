-- ==============================================================================
--  PROJECT LMS — SUPABASE PRODUCTION POSTGRESQL SCHEMA
--  Target: Bangladesh School & Coaching ERP
--  Author: Antigravity Architecture Team
--  Usage: Paste and RUN this entire script in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Types & Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'ADMIN', 'HEAD_TEACHER', 'ASSISTANT_TEACHER', 'REGULAR_STUDENT', 'EXAM_BATCH_STUDENT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE student_type AS ENUM ('REGULAR', 'EXAM_BATCH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE student_group AS ENUM ('SCIENCE', 'ARTS', 'COMMERCE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HALF_DAY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PAID', 'PARTIAL', 'DUE', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
--  TABLES
-- ==============================================================================

-- ── 1. Classes, Sections & Batches ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY DEFAULT ('cls-' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL,
  numeric_value INT DEFAULT 0,
  academic_year TEXT NOT NULL DEFAULT to_char(now(), 'YYYY'),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY DEFAULT ('sec-' || substr(md5(random()::text), 1, 8)),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_groups (
  id TEXT PRIMARY KEY DEFAULT ('grp-' || substr(md5(random()::text), 1, 8)),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name student_group NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY DEFAULT ('btc-' || substr(md5(random()::text), 1, 8)),
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  exam_year TEXT NOT NULL,
  status TEXT DEFAULT 'ONGOING',
  target_exam TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY DEFAULT ('sub-' || substr(md5(random()::text), 1, 8)),
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES class_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_bn TEXT,
  code TEXT,
  paper TEXT DEFAULT 'NONE', -- FIRST, SECOND, NONE
  total_marks INT DEFAULT 100,
  pass_marks INT DEFAULT 33,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Teachers & Staff ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY DEFAULT ('tch-' || substr(md5(random()::text), 1, 8)),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  teacher_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  full_name_bn TEXT,
  designation TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  blood_group TEXT,
  employment_type TEXT DEFAULT 'FULL_TIME',
  qualifications JSONB DEFAULT '[]'::jsonb,
  subjects JSONB DEFAULT '[]'::jsonb,
  profile_photo TEXT,
  joining_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_salary_settings (
  id TEXT PRIMARY KEY DEFAULT ('tss-' || substr(md5(random()::text), 1, 8)),
  teacher_id TEXT NOT NULL UNIQUE REFERENCES teachers(id) ON DELETE CASCADE,
  base_salary NUMERIC(12, 2) NOT NULL DEFAULT 20000,
  house_allowance NUMERIC(12, 2) DEFAULT 0,
  medical_allowance NUMERIC(12, 2) DEFAULT 0,
  transport_allowance NUMERIC(12, 2) DEFAULT 0,
  mobile_allowance NUMERIC(12, 2) DEFAULT 0,
  provident_fund_deduction NUMERIC(12, 2) DEFAULT 0,
  tax_deduction NUMERIC(12, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_salaries (
  id TEXT PRIMARY KEY DEFAULT ('sal-' || substr(md5(random()::text), 1, 8)),
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  base_salary NUMERIC(12, 2) NOT NULL,
  total_allowance NUMERIC(12, 2) DEFAULT 0,
  total_deduction NUMERIC(12, 2) DEFAULT 0,
  bonus NUMERIC(12, 2) DEFAULT 0,
  net_payable NUMERIC(12, 2) NOT NULL,
  payment_status TEXT DEFAULT 'UNPAID', -- PAID, UNPAID, PARTIAL
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Students ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT ('std-' || substr(md5(random()::text), 1, 8)),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id TEXT UNIQUE NOT NULL,
  registration_number TEXT,
  roll_number TEXT NOT NULL,
  full_name_en TEXT NOT NULL,
  full_name_bn TEXT,
  gender TEXT NOT NULL DEFAULT 'MALE',
  date_of_birth DATE,
  blood_group TEXT,
  type student_type DEFAULT 'REGULAR',
  profile_photo TEXT,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  class_name TEXT,
  section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  section_name TEXT,
  group_id TEXT REFERENCES class_groups(id) ON DELETE SET NULL,
  batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
  batch_name TEXT,
  shift TEXT DEFAULT 'DAY',
  version TEXT DEFAULT 'BANGLA',
  session TEXT NOT NULL DEFAULT to_char(now(), 'YYYY'),
  admission_date DATE DEFAULT CURRENT_DATE,
  admission_number TEXT,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, PASSED, LEFT, SUSPENDED
  mobile TEXT NOT NULL,
  email TEXT,
  present_address TEXT,
  permanent_address TEXT,
  father JSONB DEFAULT '{}'::jsonb, -- { name, mobile, occupation }
  mother JSONB DEFAULT '{}'::jsonb, -- { name, mobile, occupation }
  guardian JSONB DEFAULT '{}'::jsonb, -- { name, relation, mobile, address }
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Attendance & Leaves ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT ('att-' || substr(md5(random()::text), 1, 8)),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT,
  roll_number TEXT,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'PRESENT',
  time_in TEXT,
  note TEXT,
  marked_at TIMESTAMPTZ DEFAULT now(),
  marked_by TEXT DEFAULT 'Admin',
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS teacher_attendance (
  id TEXT PRIMARY KEY DEFAULT ('tatt-' || substr(md5(random()::text), 1, 8)),
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'PRESENT',
  check_in TEXT,
  check_out TEXT,
  note TEXT,
  marked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, date)
);

CREATE TABLE IF NOT EXISTS teacher_leave_balances (
  id TEXT PRIMARY KEY DEFAULT ('tlb-' || substr(md5(random()::text), 1, 8)),
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  year INT NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  casual_leave_total INT DEFAULT 14,
  casual_leave_used INT DEFAULT 0,
  sick_leave_total INT DEFAULT 14,
  sick_leave_used INT DEFAULT 0,
  earned_leave_total INT DEFAULT 10,
  earned_leave_used INT DEFAULT 0,
  UNIQUE(teacher_id, year)
);

CREATE TABLE IF NOT EXISTS leaves (
  id TEXT PRIMARY KEY DEFAULT ('lev-' || substr(md5(random()::text), 1, 8)),
  applicant_type TEXT NOT NULL DEFAULT 'STUDENT', -- STUDENT, TEACHER
  applicant_id TEXT NOT NULL,
  applicant_name TEXT,
  leave_type TEXT NOT NULL DEFAULT 'CASUAL',
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status leave_status DEFAULT 'PENDING',
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. Routines & Calendar ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY DEFAULT ('rtn-' || substr(md5(random()::text), 1, 8)),
  target_type TEXT NOT NULL DEFAULT 'CLASS', -- CLASS, BATCH
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  day TEXT NOT NULL, -- SUNDAY, MONDAY, etc.
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY DEFAULT ('cal-' || substr(md5(random()::text), 1, 8)),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  type TEXT NOT NULL, -- HOLIDAY, EVENT, EXAM
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 6. Exams & Results ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_held (
  id TEXT PRIMARY KEY DEFAULT ('exm-' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'CLASS', -- CLASS, BATCH
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL DEFAULT 'TERM',
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'UPCOMING', -- UPCOMING, ONGOING, COMPLETED
  result_published BOOLEAN DEFAULT FALSE,
  exam_held_schedules JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 7. Finance, Payments & Expenses ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_structures (
  id TEXT PRIMARY KEY DEFAULT ('fee-' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'CLASS',
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  fee_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT ('pay-' || substr(md5(random()::text), 1, 8)),
  invoice_no TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  fine_amount NUMERIC(12, 2) DEFAULT 0,
  net_amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2) NOT NULL,
  payment_method payment_method DEFAULT 'CASH',
  transaction_id TEXT,
  status payment_status DEFAULT 'PAID',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  received_by TEXT DEFAULT 'Accounts Officer',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS manual_dues (
  id TEXT PRIMARY KEY DEFAULT ('mnd-' || substr(md5(random()::text), 1, 8)),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'DUE',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_waivers (
  id TEXT PRIMARY KEY DEFAULT ('wav-' || substr(md5(random()::text), 1, 8)),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  waiver_type TEXT NOT NULL,
  discount_percentage NUMERIC(5, 2),
  fixed_discount NUMERIC(12, 2),
  reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monthly_billings (
  id TEXT PRIMARY KEY DEFAULT ('bil-' || substr(md5(random()::text), 1, 8)),
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  student_count INT DEFAULT 0,
  total_billed NUMERIC(12, 2) DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_expense_categories (
  id TEXT PRIMARY KEY DEFAULT ('exc-' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL UNIQUE,
  budget NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_expenses (
  id TEXT PRIMARY KEY DEFAULT ('exp-' || substr(md5(random()::text), 1, 8)),
  voucher_no TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT REFERENCES finance_expense_categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method payment_method DEFAULT 'CASH',
  paid_to TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id TEXT PRIMARY KEY DEFAULT ('txn-' || substr(md5(random()::text), 1, 8)),
  type TEXT NOT NULL, -- INCOME, EXPENSE
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method payment_method DEFAULT 'CASH',
  reference_id TEXT,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 8. Notices & Institutional Settings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY DEFAULT ('not-' || substr(md5(random()::text), 1, 8)),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'ALL', -- ALL, CLASS, BATCH, URGENT
  target_id TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS institution_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_setting',
  school_name TEXT NOT NULL DEFAULT 'Panjeree Ideal Academy',
  school_name_bn TEXT DEFAULT 'পাঞ্জেরী আইডিয়াল একাডেমি',
  eiin TEXT DEFAULT '134567',
  board TEXT DEFAULT 'Dhaka',
  logo_url TEXT,
  signature_url TEXT,
  phone TEXT DEFAULT '+880 1700-000000',
  email TEXT DEFAULT 'info@school.edu.bd',
  address TEXT DEFAULT 'Dhaka, Bangladesh',
  academic_session TEXT DEFAULT '2026',
  theme_color TEXT DEFAULT '#4f46e5',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
--  INDEXES FOR HIGH PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_class_section ON students(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attendance_query ON attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_routines_class_day ON routines(class_id, day);
CREATE INDEX IF NOT EXISTS idx_routines_batch_day ON routines(batch_id, day);

-- ==============================================================================
--  ROW LEVEL SECURITY (RLS) POLICIES
--  (Enable when you connect Supabase Auth)
-- ==============================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated read by default (tune based on your user_role later)
CREATE POLICY "Public Read Access" ON notices FOR SELECT USING (true);
CREATE POLICY "Public Read Classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Public Read Sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public Read Subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow All For Dev" ON students FOR ALL USING (true);
CREATE POLICY "Allow All For Dev Teachers" ON teachers FOR ALL USING (true);
CREATE POLICY "Allow All For Dev Attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow All For Dev Payments" ON payments FOR ALL USING (true);
