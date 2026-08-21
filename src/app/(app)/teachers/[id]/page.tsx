import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { initials } from "@/lib/utils";
import { deleteTeacherAction, toggleTeacherStatusAction } from "../actions";
import type { ClassRow, Subject } from "@/lib/types";
import { format, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const t = getDictionary(await getLocale());
  const { id } = await params;
  const supabase = await createClient();

  const { data: teacher } = await supabase.from("teachers").select("*").eq("id", id).maybeSingle();
  if (!teacher) notFound();

  const [{ data: ts }, { data: tc }] = await Promise.all([
    supabase.from("teacher_subjects").select("subjects(*)").eq("teacher_id", id),
    supabase.from("teacher_classes").select("classes(*)").eq("teacher_id", id),
  ]);

  const subjects = (ts ?? []).map((r) => r.subjects).filter(Boolean) as unknown as Subject[];
  const classes = (tc ?? []).map((r) => r.classes).filter(Boolean) as unknown as ClassRow[];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t.nav.dashboard, href: "/dashboard" },
          { label: t.nav.teachers, href: "/teachers" },
          { label: teacher.full_name },
        ]}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
            {initials(teacher.full_name)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{teacher.full_name}</h1>
            <p className="text-sm text-slate-400">{teacher.employee_id}</p>
            <div className="mt-1">
              <form action={toggleTeacherStatusAction}>
                <input type="hidden" name="id" value={teacher.id} />
                <input type="hidden" name="status" value={teacher.status} />
                <button type="submit">
                  <Badge tone={teacher.status}>{teacher.status === "active" ? t.common.active : t.common.inactive}</Badge>
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/teachers/${teacher.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} /> {t.students.editProfile}
          </Link>
          <form action={deleteTeacherAction}>
            <input type="hidden" name="id" value={teacher.id} />
            <ConfirmButton
              message={format(t.teachers.confirmRemoveTeacher, { name: teacher.full_name })}
              className="h-auto w-auto rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 size={14} /> {t.common.delete}
              </span>
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">{t.teachers.contact}</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" /> {teacher.phone || "—"}
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" /> {teacher.email || "—"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">{t.teachers.subjects}</h2>
          <div className="flex flex-wrap gap-2">
            {subjects.length ? (
              subjects.map((s) => (
                <span key={s.id} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {s.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">{t.teachers.noSubjectsAssigned}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">{t.teachers.assignedClasses}</h2>
          <div className="flex flex-wrap gap-2">
            {classes.length ? (
              classes.map((c) => (
                <Link
                  key={c.id}
                  href={`/classes/${c.id}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {c.class_name}
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-400">{t.teachers.noClassesAssigned}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
