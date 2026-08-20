import Link from "next/link";
import { Plus, Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { initials } from "@/lib/utils";
import type { ClassRow, Subject, Teacher } from "@/lib/types";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class?: string }>;
}) {
  const { q, class: classFilter } = await searchParams;
  const supabase = await createClient();

  let teacherIdsForClass: string[] | null = null;
  if (classFilter) {
    const { data } = await supabase.from("teacher_classes").select("teacher_id").eq("class_id", classFilter);
    teacherIdsForClass = (data ?? []).map((d) => d.teacher_id);
  }

  let query = supabase.from("teachers").select("*").order("full_name");
  if (q) query = query.or(`full_name.ilike.%${q}%,employee_id.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  if (teacherIdsForClass) query = query.in("id", teacherIdsForClass.length ? teacherIdsForClass : ["00000000-0000-0000-0000-000000000000"]);

  const { data: teachers } = await query;
  const list = (teachers ?? []) as Teacher[];

  const [{ data: allSubjects }, { data: allClasses }, { data: teacherSubjects }, { data: teacherClasses }] =
    await Promise.all([
      supabase.from("subjects").select("*"),
      supabase.from("classes").select("*"),
      supabase.from("teacher_subjects").select("teacher_id, subject_id"),
      supabase.from("teacher_classes").select("teacher_id, class_id"),
    ]);

  const subjectById = new Map(((allSubjects ?? []) as Subject[]).map((s) => [s.id, s.name]));
  const classById = new Map(((allClasses ?? []) as ClassRow[]).map((c) => [c.id, c.class_name]));

  const subjectsByTeacher = new Map<string, string[]>();
  for (const row of teacherSubjects ?? []) {
    const arr = subjectsByTeacher.get(row.teacher_id) ?? [];
    const name = subjectById.get(row.subject_id);
    if (name) arr.push(name);
    subjectsByTeacher.set(row.teacher_id, arr);
  }
  const classesByTeacher = new Map<string, string[]>();
  for (const row of teacherClasses ?? []) {
    const arr = classesByTeacher.get(row.teacher_id) ?? [];
    const name = classById.get(row.class_id);
    if (name) arr.push(name);
    classesByTeacher.set(row.teacher_id, arr);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Teachers" }]} />
      <PageHeader
        title="Teachers"
        description="Manage faculty profiles, subjects, and class assignments."
        action={
          <Link
            href="/teachers/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Teacher
          </Link>
        }
      />

      <form className="flex gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, employee ID, email or phone..."
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </form>

      {list.length === 0 ? (
        <EmptyState title="No teachers found" description="Add a teacher to assign them to subjects and classes." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {initials(t.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{t.full_name}</p>
                    <p className="text-xs text-slate-400">{t.employee_id}</p>
                  </div>
                </div>
                <Badge tone={t.status}>{t.status}</Badge>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-medium text-slate-400">SUBJECTS</p>
                  <p className="mt-0.5 text-slate-700">{(subjectsByTeacher.get(t.id) ?? []).join(", ") || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-400">ASSIGNED CLASSES</p>
                  <p className="mt-0.5 text-slate-700">{(classesByTeacher.get(t.id) ?? []).join(", ") || "—"}</p>
                </div>
              </div>

              <div className="mb-4 space-y-1 text-xs text-slate-500">
                {t.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={12} /> {t.phone}
                  </p>
                )}
                {t.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail size={12} /> {t.email}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link href={`/teachers/${t.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  View Profile
                </Link>
                <Link href={`/teachers/${t.id}/edit`} className="text-xs font-medium text-blue-600 hover:underline">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
