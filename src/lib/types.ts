// Hand-written types mirroring the Supabase schema in supabase/schema.sql.
// If you change the schema, update these to match.

export type Status = "active" | "inactive";
export type RecordLock = "open" | "locked";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";
export type FeeStatus = "paid" | "pending" | "overdue";
export type Gender = "Male" | "Female" | "Other";

export interface AcademicYear {
  id: string;
  year_label: string;
  start_date: string;
  end_date: string;
  status: Status;
  record_lock: RecordLock;
  is_current: boolean;
  created_at: string;
}

export interface ClassRow {
  id: string;
  academic_year_id: string;
  class_name: string;
  room: string | null;
  capacity: number;
  status: Status;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  employee_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: Status;
  created_at: string;
}

export interface TeacherClass {
  teacher_id: string;
  class_id: string;
}

export interface TeacherSubject {
  teacher_id: string;
  subject_id: string;
}

export interface Student {
  id: string;
  student_id: string;
  admission_no: string | null;
  full_name: string;
  dob: string | null;
  gender: Gender | null;
  blood_group: string | null;
  class_id: string | null;
  academic_year_id: string | null;
  roll_no: number | null;
  status: Status;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  address: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  created_at: string;
}

export interface Exam {
  id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  name: string;
  term: string | null;
  exam_date: string | null;
  total_marks: number;
  created_at: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  created_at: string;
}

export interface Fee {
  id: string;
  student_id: string;
  academic_year_id: string;
  fee_type: string;
  amount: number;
  amount_paid: number;
  due_date: string | null;
  paid_date: string | null;
  status: FeeStatus;
  created_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  subject_id: string | null;
  teacher_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
}

export interface TeacherRemark {
  id: string;
  student_id: string;
  teacher_id: string | null;
  remark: string;
  remark_date: string;
  created_at: string;
}

export interface BehaviorRecord {
  id: string;
  student_id: string;
  type: "positive" | "negative" | "neutral";
  description: string;
  record_date: string;
  created_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  name: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  day_of_week: number;
  period: number;
  subject_id: string | null;
  teacher_id: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

// Loosely typed Database shape (Supabase's generated types can replace this later).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
