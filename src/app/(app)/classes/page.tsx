import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteClassAction, toggleClassStatusAction } from "./actions";
import type { ClassRow } from "@/lib/types";
import { format, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function ClassesPage() {
  const t = getDictionary(await getLocale());
  const supabase = await createClient();
  const { years, selected } = await getAcademicYearContext();

  const classesQuery = selected
    ? supabase.from("classes").select("*").eq("academic_year_id", selected.id).order("class_name")
    : supabase.from("classes").select("*").order("class_name");
  const { data: classes } = await classesQuery;
  const list = (classes ?? []) as ClassRow[];

  const yearById = new Map(years.map((y) => [y.id, y]));

  const counts = await Promise.all(
    list.map(async (c) => {
      const [{ count: studentCount }, { count: teacherCount }] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("class_id", c.id),
        supabase.from("teacher_classes").select("teacher_id", { count: "exact", head: true }).eq("class_id", c.id),
      ]);
      return { id: c.id, studentCount: studentCount ?? 0, teacherCount: teacherCount ?? 0 };
    })
  );
  const countMap = new Map(counts.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t.nav.dashboard, href: "/dashboard" }, { label: t.nav.classes }]} />
      <PageHeader
        title={t.classes.title}
        description={t.classes.subtitle}
        action={
          <Link
            href="/classes/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> {t.classes.addClass}
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title={t.classes.noClassesYet}
          description={t.classes.noClassesYetBody}
          action={
            <Link
              href="/classes/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} /> {t.classes.addClass}
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t.classes.classSection}</th>
                <th className="px-4 py-3 font-medium">{t.classHub.academicYear}</th>
                <th className="px-4 py-3 font-medium">{t.classes.studentsCapacity}</th>
                <th className="px-4 py-3 font-medium">{t.classes.teachersCount}</th>
                <th className="px-4 py-3 font-medium">{t.common.status}</th>
                <th className="px-4 py-3 font-medium text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((c, i) => {
                const counts = countMap.get(c.id);
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                          {i + 1}
                        </div>
                        <div>
                          <Link href={`/classes/${c.id}`} className="font-semibold text-slate-800 hover:text-blue-600">
                            {c.class_name}
                          </Link>
                          <p className="text-xs text-slate-400">{t.classHub.room} {c.room || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{yearById.get(c.academic_year_id)?.year_label ?? "—"}</td>
                    <td className="px-4 py-3">
                      {counts?.studentCount ?? 0} / {c.capacity}
                    </td>
                    <td className="px-4 py-3">{counts?.teacherCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <form action={toggleClassStatusAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="status" value={c.status} />
                        <button type="submit">
                          <Badge tone={c.status}>{c.status === "active" ? t.common.active : t.common.inactive}</Badge>
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/classes/${c.id}`}
                          title={t.classes.openAction}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          href={`/classes/${c.id}/edit`}
                          title={t.common.edit}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil size={15} />
                        </Link>
                        {(counts?.studentCount ?? 0) === 0 && (
                          <form action={deleteClassAction}>
                            <input type="hidden" name="id" value={c.id} />
                            <ConfirmButton
                              title={t.common.delete}
                              message={format(t.classes.confirmDeleteClass, { name: c.class_name })}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </ConfirmButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{t.classes.safeRecordManagement}.</span> {t.classes.safeRecordManagementBody}
          </p>
        </div>
      )}
    </div>
  );
}
