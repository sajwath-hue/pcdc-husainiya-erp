-- Manbaul Huda Arabic College — School Management ERP
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- for a fresh project. Safe to re-run: every statement is idempotent.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Profiles (extends auth.users with role/name for staff accounts)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('super_admin', 'admin', 'teacher')),
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- Academic Years
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists academic_years (
  id uuid primary key default gen_random_uuid(),
  year_label text not null unique,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  record_lock text not null default 'open' check (record_lock in ('open', 'locked')),
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Classes
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  class_name text not null,
  room text,
  capacity integer not null default 40,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Subjects
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Teachers
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists teacher_classes (
  teacher_id uuid not null references teachers (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  primary key (teacher_id, class_id)
);

create table if not exists teacher_subjects (
  teacher_id uuid not null references teachers (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  primary key (teacher_id, subject_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Students
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  admission_no text,
  full_name text not null,
  dob date,
  gender text check (gender in ('Male', 'Female', 'Other')),
  blood_group text,
  class_id uuid references classes (id) on delete set null,
  academic_year_id uuid references academic_years (id) on delete set null,
  roll_no integer,
  status text not null default 'active' check (status in ('active', 'inactive')),
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  address text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Attendance
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'leave')),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Exams & Results
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  name text not null,
  term text,
  exam_date date,
  total_marks numeric not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  marks_obtained numeric not null,
  created_at timestamptz not null default now(),
  unique (exam_id, student_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Fees
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  academic_year_id uuid not null references academic_years (id) on delete cascade,
  fee_type text not null default 'Tuition',
  amount numeric not null default 0,
  amount_paid numeric not null default 0,
  due_date date,
  paid_date date,
  status text not null default 'pending' check (status in ('paid', 'pending', 'overdue')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Assignments
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id) on delete cascade,
  subject_id uuid references subjects (id) on delete set null,
  teacher_id uuid references teachers (id) on delete set null,
  title text not null,
  description text,
  due_date date,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Teacher Remarks (per student)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists teacher_remarks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  teacher_id uuid references teachers (id) on delete set null,
  remark text not null,
  remark_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Behavior Records (per student)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists behavior_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  type text not null default 'neutral' check (type in ('positive', 'negative', 'neutral')),
  description text not null,
  record_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Documents (per student) — metadata/link only, no file storage required
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists student_documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  name text not null,
  file_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Timetable
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists timetable_slots (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7), -- 1 = Monday
  period integer not null,
  subject_id uuid references subjects (id) on delete set null,
  teacher_id uuid references teachers (id) on delete set null,
  start_time time,
  end_time time
);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security — any signed-in staff account has full access.
-- (Single-institute internal tool; staff accounts are created by an admin,
-- there is no public sign-up.)
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'academic_years', 'classes', 'subjects', 'teachers', 'teacher_classes',
      'teacher_subjects', 'students', 'attendance', 'exams', 'exam_results',
      'fees', 'assignments', 'teacher_remarks', 'behavior_records',
      'student_documents', 'timetable_slots', 'profiles'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "authenticated_full_access" on %I;', t);
    execute format(
      'create policy "authenticated_full_access" on %I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Helpful indexes
-- ─────────────────────────────────────────────────────────────────────────
create index if not exists idx_classes_year on classes (academic_year_id);
create index if not exists idx_students_class on students (class_id);
create index if not exists idx_students_year on students (academic_year_id);
create index if not exists idx_attendance_class_date on attendance (class_id, date);
create index if not exists idx_attendance_student on attendance (student_id);
create index if not exists idx_exams_class on exams (class_id);
create index if not exists idx_exam_results_student on exam_results (student_id);
create index if not exists idx_fees_student on fees (student_id);
create index if not exists idx_assignments_class on assignments (class_id);
create index if not exists idx_remarks_student on teacher_remarks (student_id);
