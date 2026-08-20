import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { formatDate } from "@/lib/utils";
import { deleteAssignmentAction } from "./actions";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const { class: classFilter } = await searchParams;
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  const { data: classes } = await supabase
    .from("classes")
    .select("id")
    .eq("academic_year_id", selected?.id ?? "");
  const classIds = (classes ?? []).map((c) => c.id);

  let query = supabase
    .from("assignments")
    .select("*, classes(class_name), subjects(name), teachers(full_name)")
    .order("due_date", { ascending: false });
  if (classFilter) query = query.eq("class_id", classFilter);
  else if (classIds.length) query = query.in("class_id", classIds);

  const { data: assignments } = await query;
  type Row = {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    classes: { class_name: string } | null;
    subjects: { name: string } | null;
    teachers: { full_name: string } | null;
  };
  const list = (assignments ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assignments" }]} />
      <PageHeader
        title="Assignments"
        description="Classwork assigned to each class."
        action={
          <Link
            href="/assignments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Assignment
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState title="No assignments yet" description="Assign classwork to a class to see it here." />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="font-medium text-slate-800">{a.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {a.classes?.class_name ?? "—"} · {a.subjects?.name ?? "General"} · {a.teachers?.full_name ?? "Unassigned"}
                </p>
                {a.description && <p className="mt-2 text-sm text-slate-600">{a.description}</p>}
                <p className="mt-2 text-xs text-slate-400">Due {formatDate(a.due_date)}</p>
              </div>
              <form action={deleteAssignmentAction}>
                <input type="hidden" name="id" value={a.id} />
                <ConfirmButton message={`Delete assignment "${a.title}"?`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50">
                  <Trash2 size={15} />
                </ConfirmButton>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
