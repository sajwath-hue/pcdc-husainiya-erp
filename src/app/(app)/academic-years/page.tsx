import Link from "next/link";
import { Plus, Pencil, Trash2, Lock, LockOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { formatDate } from "@/lib/utils";
import {
  deleteAcademicYearAction,
  toggleRecordLockAction,
  toggleStatusAction,
} from "./actions";
import type { AcademicYear } from "@/lib/types";

export default async function AcademicYearsPage() {
  const supabase = await createClient();
  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .order("year_label", { ascending: false });

  const list = (years ?? []) as AcademicYear[];

  const counts = await Promise.all(
    list.map(async (y) => {
      const [{ count: classCount }, { count: studentCount }] = await Promise.all([
        supabase.from("classes").select("id", { count: "exact", head: true }).eq("academic_year_id", y.id),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("academic_year_id", y.id),
      ]);
      return { id: y.id, classCount: classCount ?? 0, studentCount: studentCount ?? 0 };
    })
  );
  const countMap = new Map(counts.map((c) => [c.id, c]));

  const current = list.find((y) => y.is_current);
  const activeCount = list.filter((y) => y.status === "active").length;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Academic Years" }]} />
      <PageHeader
        title="Academic Years"
        description="Manage school sessions while preserving complete historical records."
        action={
          <Link
            href="/academic-years/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Academic Year
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Academic Years" value={list.length} />
        <StatCard label="Active Years" value={activeCount} />
        <StatCard label="Current Session" value={current?.year_label ?? "—"} />
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No academic years yet"
          description="Create your first academic year to start adding classes and students."
          action={
            <Link
              href="/academic-years/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Add Academic Year
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Academic Year</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Classes</th>
                <th className="px-4 py-3 font-medium">Students</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Record Lock</th>
                <th className="px-4 py-3 font-medium">Current</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((y) => {
                const c = countMap.get(y.id);
                return (
                  <tr key={y.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{y.year_label}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(y.start_date)} – {formatDate(y.end_date)}
                    </td>
                    <td className="px-4 py-3">{c?.classCount ?? 0}</td>
                    <td className="px-4 py-3">{c?.studentCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <form action={toggleStatusAction}>
                        <input type="hidden" name="id" value={y.id} />
                        <input type="hidden" name="status" value={y.status} />
                        <button type="submit">
                          <Badge tone={y.status}>{y.status}</Badge>
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={y.record_lock}>{y.record_lock}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {y.is_current ? (
                        <span className="text-xs font-semibold text-blue-600">Current</span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <form action={toggleRecordLockAction}>
                          <input type="hidden" name="id" value={y.id} />
                          <input type="hidden" name="record_lock" value={y.record_lock} />
                          <button
                            type="submit"
                            title={y.record_lock === "open" ? "Lock records" : "Unlock records"}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            {y.record_lock === "open" ? <LockOpen size={15} /> : <Lock size={15} />}
                          </button>
                        </form>
                        <Link
                          href={`/academic-years/${y.id}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        {(c?.classCount ?? 0) === 0 && (
                          <form action={deleteAcademicYearAction}>
                            <input type="hidden" name="id" value={y.id} />
                            <ConfirmButton
                              title="Delete"
                              message={`Delete academic year ${y.year_label}? This cannot be undone.`}
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
            <span className="font-medium text-slate-700">Historical data is protected.</span>{" "}
            Years containing classes cannot be deleted; deactivate them to retain student history.
          </p>
        </div>
      )}
    </div>
  );
}
