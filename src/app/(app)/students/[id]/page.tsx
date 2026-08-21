import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { getStudentSummary } from "@/lib/data/students";
import { Breadcrumb } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { initials } from "@/lib/utils";
import { PromoteStudent } from "./PromoteStudent";
import {
  OverviewTab,
  ProfileTab,
  AttendanceTab,
  ExamsTab,
  ResultsTab,
  AssignmentsTab,
  FeesTab,
  BehaviorTab,
  RemarksTab,
  DocumentsTab,
  YearlyReportTab,
} from "./tabs";
import type { ClassRow, Student } from "@/lib/types";

const TABS = [
  "overview",
  "profile",
  "attendance",
  "exams",
  "results",
  "assignments",
  "fees",
  "behavior",
  "remarks",
  "documents",
  "yearly-report",
] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  profile: "Profile",
  attendance: "Attendance",
  exams: "Exams",
  results: "Results",
  assignments: "Assignments",
  fees: "Fees",
  behavior: "Behavior",
  remarks: "Teacher Remarks",
  documents: "Documents",
  "yearly-report": "Yearly Report",
};

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(tabParam ?? "") ? (tabParam as Tab) : "overview";

  const supabase = await createClient();
  const { data: student } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  if (!student) notFound();

  const { data: cls } = student.class_id
    ? await supabase.from("classes").select("*").eq("id", student.class_id).maybeSingle()
    : { data: null };

  const summary = await getStudentSummary(supabase, id, student.class_id);
  const { years } = await getAcademicYearContext();
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("academic_year_id", student.academic_year_id ?? "")
    .order("class_name");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Classes", href: "/classes" },
          ...(cls ? [{ label: cls.class_name, href: `/classes/${cls.id}` }] : []),
          { label: "Students", href: "/students" },
          { label: student.full_name },
        ]}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
            {initials(student.full_name)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{student.full_name}</h1>
            <p className="text-sm text-slate-400">
              Roll No: {student.roll_no ?? "—"} · {cls?.class_name ?? "Unassigned"} · {student.student_id}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={student.status}>{student.status === "active" ? "Active Student" : "Inactive"}</Badge>
          <Link
            href={`/students/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} /> Edit Profile
          </Link>
          <PromoteStudent
            studentId={id}
            years={years}
            classes={(classes ?? []) as ClassRow[]}
            currentClassId={student.class_id}
            currentYearId={student.academic_year_id}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Attendance" value={`${summary.attendancePct}%`} />
        <StatCard label="Academic Average" value={`${summary.academicAveragePct}%`} />
        <StatCard label="Class Position" value={summary.classPosition ? `#${summary.classPosition}` : "—"} />
        <StatCard label="Total Exams" value={summary.totalExams} />
        <StatCard label="Overall Grade" value={summary.grade} />
        <StatCard label="Class Size" value={summary.classSize} />
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <Link
              key={t}
              href={`/students/${id}?tab=${t}`}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {TAB_LABELS[t]}
            </Link>
          ))}
        </nav>
      </div>

      <TabContent tab={tab} student={student as Student} cls={cls as ClassRow | null} />
    </div>
  );
}

function TabContent({ tab, student, cls }: { tab: Tab; student: Student; cls: ClassRow | null }) {
  switch (tab) {
    case "overview":
      return <OverviewTab student={student} cls={cls} />;
    case "profile":
      return <ProfileTab student={student} />;
    case "attendance":
      return <AttendanceTab studentId={student.id} />;
    case "exams":
      return <ExamsTab classId={student.class_id} />;
    case "results":
      return <ResultsTab studentId={student.id} />;
    case "assignments":
      return <AssignmentsTab classId={student.class_id} />;
    case "fees":
      return <FeesTab studentId={student.id} />;
    case "behavior":
      return <BehaviorTab studentId={student.id} />;
    case "remarks":
      return <RemarksTab studentId={student.id} />;
    case "documents":
      return <DocumentsTab studentId={student.id} />;
    case "yearly-report":
      return <YearlyReportTab student={student} />;
  }
}
