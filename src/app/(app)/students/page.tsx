import Link from "next/link";
import { Plus, Download, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { getStudentQuickStatsBulk } from "@/lib/data/students-list";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { initials } from "@/lib/utils";
import { ImportStudents } from "./ImportStudents";
import type { ClassRow, Student } from "@/lib/types";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class?: string; status?: string }>;
}) {
  const { q, class: classFilter, status } = await searchParams;
  const supabase = await createClient();
  const { years, selected } = await getAcademicYearContext();

  let query = supabase.from("students").select("*").order("full_name");
  if (selected) query = query.eq("academic_year_id", selected.id);
  if (classFilter) query = query.eq("class_id", classFilter);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`full_name.ilike.%${q}%,student_id.ilike.%${q}%,admission_no.ilike.%${q}%`);

  const { data: students } = await query;
  const list = (students ?? []) as Student[];

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("academic_year_id", selected?.id ?? "");
  const classById = new Map(((classes ?? []) as ClassRow[]).map((c) => [c.id, c]));
  const currentClass = classFilter ? classById.get(classFilter) : null;

  const stats = await getStudentQuickStatsBulk(
    supabase,
    list.map((s) => s.id)
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          ...(currentClass
            ? [{ label: "Classes", href: "/classes" }, { label: currentClass.class_name, href: `/classes/${currentClass.id}` }]
            : []),
          { label: "Students" },
        ]}
      />
      <PageHeader
        title={currentClass ? `${currentClass.class_name} Students` : "Students"}
        description="Profiles, guardians and academic-year enrollment history."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/students/csv-template"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileSpreadsheet size={15} /> CSV Template
            </Link>
            <Link
              href="/students/export"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={15} /> Export Students
            </Link>
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Add Student
            </Link>
          </div>
        }
      />

      <ImportStudents years={years} selectedYearId={selected?.id} />

      <form className="flex flex-wrap gap-3">
        {classFilter && <input type="hidden" name="class" value={classFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search student, ID, roll, admission or guardian..."
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </form>

      {list.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Add a student manually or import a class list from CSV."
          action={
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Add Student
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => {
              const stat = stats.get(s.id);
              const cls = s.class_id ? classById.get(s.class_id) : null;
              return (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {initials(s.full_name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{s.full_name}</p>
                        <p className="text-xs text-slate-400">
                          Roll {s.roll_no ?? "—"} · {s.student_id}
                        </p>
                      </div>
                    </div>
                    <Badge tone={s.status}>{s.status}</Badge>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium text-slate-400">CLASS</p>
                      <p className="mt-0.5 text-slate-700">{cls?.class_name ?? "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-400">ATTENDANCE</p>
                      <p className="mt-0.5 text-slate-700">{stat?.attendancePct ?? 0}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-400">ACADEMIC AVERAGE</p>
                      <p className="mt-0.5 text-slate-700">{stat?.academicAveragePct ?? 0}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-400">GRADE</p>
                      <p className="mt-0.5 text-slate-700">{stat?.grade ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link href={`/students/${s.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      View Full Profile
                    </Link>
                    <Link href={`/students/${s.id}/edit`} className="text-xs font-medium text-blue-600 hover:underline">
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-slate-500">Showing 1-{list.length} of {list.length} students</p>
        </>
      )}
    </div>
  );
}
