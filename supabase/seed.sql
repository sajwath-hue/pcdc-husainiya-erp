-- Optional demo data for Manbaul Huda Arabic College ERP.
-- Run AFTER schema.sql, in the Supabase SQL editor. Safe to skip entirely —
-- the app works fine with an empty database, starting from Academic Years.

with year as (
  insert into academic_years (year_label, start_date, end_date, is_current)
  values ('2026-27', '2026-04-01', '2027-03-31', true)
  returning id
),
subj as (
  insert into subjects (name)
  values ('Arabic'), ('Quran Studies'), ('Fiqh'), ('English'), ('Mathematics'), ('Science')
  returning id, name
),
cls as (
  insert into classes (academic_year_id, class_name, room, capacity)
  select year.id, v.class_name, v.room, 40
  from year, (values
    ('Class 1-A', 'A-101'),
    ('Class 2-A', 'A-102'),
    ('Class 3-A', 'A-103'),
    ('Class 4-A', 'B-201'),
    ('Class 5-A', 'B-202'),
    ('Class 6-A', 'B-203')
  ) as v(class_name, room)
  returning id, class_name
),
tch as (
  insert into teachers (employee_id, full_name, email, phone)
  values
    ('TCH-001', 'Fatima Noor', 'fatima@manbaulhuda.local', '0300 1234567'),
    ('TCH-002', 'Ahmed Raza', 'ahmed@manbaulhuda.local', '0301 2345678'),
    ('TCH-003', 'Sana Malik', 'sana@manbaulhuda.local', '0302 3456789')
  returning id, employee_id
)
select 1;

-- Assign teachers to classes and subjects (run after the CTE above commits).
insert into teacher_classes (teacher_id, class_id)
select t.id, c.id
from teachers t, classes c
where (t.employee_id = 'TCH-002' and c.class_name in ('Class 1-A', 'Class 4-A'))
   or (t.employee_id = 'TCH-001' and c.class_name in ('Class 3-A', 'Class 6-A'))
   or (t.employee_id = 'TCH-003' and c.class_name in ('Class 2-A', 'Class 5-A'));

insert into teacher_subjects (teacher_id, subject_id)
select t.id, s.id
from teachers t, subjects s
where (t.employee_id = 'TCH-002' and s.name = 'English')
   or (t.employee_id = 'TCH-001' and s.name = 'Mathematics')
   or (t.employee_id = 'TCH-003' and s.name = 'Science');

-- Two demo students in Class 1-A.
insert into students (student_id, admission_no, full_name, dob, gender, blood_group, class_id, academic_year_id, roll_no, guardian_name, guardian_phone)
select 'STU-2026-0001', 'ADM-2026-1', 'Ali Khan', '2014-01-12', 'Male', 'A+', c.id, c.academic_year_id, 1, 'Khan Sahib', '0300 5550001'
from classes c where c.class_name = 'Class 1-A';

insert into students (student_id, admission_no, full_name, dob, gender, blood_group, class_id, academic_year_id, roll_no, guardian_name, guardian_phone)
select 'STU-2026-0007', 'ADM-2026-7', 'Usman Tariq', '2014-03-20', 'Male', 'B+', c.id, c.academic_year_id, 7, 'Tariq Mehmood', '0300 5550007'
from classes c where c.class_name = 'Class 1-A';

-- A sample exam with a result for Ali Khan.
with e as (
  insert into exams (academic_year_id, class_id, subject_id, name, term, exam_date, total_marks)
  select c.academic_year_id, c.id, s.id, 'Mid Term', 'Term 1', current_date - 10, 100
  from classes c, subjects s
  where c.class_name = 'Class 1-A' and s.name = 'Arabic'
  returning id
)
insert into exam_results (exam_id, student_id, marks_obtained)
select e.id, st.id, 82
from e, students st
where st.student_id = 'STU-2026-0001';

-- A week of attendance for both students.
insert into attendance (student_id, class_id, date, status)
select st.id, st.class_id, d::date, 'present'
from students st, generate_series(current_date - 6, current_date, interval '1 day') d
where st.class_id = (select id from classes where class_name = 'Class 1-A')
on conflict (student_id, date) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- Staff login
-- ─────────────────────────────────────────────────────────────────────────
-- This seed does not create a login user (Supabase Auth passwords must be
-- created through the Auth Admin API or dashboard, not plain SQL).
-- After running this file: Supabase Dashboard → Authentication → Users →
-- "Add user" → set an email + password for your first admin. A `profiles`
-- row is created for them automatically (see the trigger in schema.sql).
-- Then sign in at /login with that email and password.
