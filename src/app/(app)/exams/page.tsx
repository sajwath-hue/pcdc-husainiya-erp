import Link from "next/link";
import { Plus, Trash2, ClipboardEdit, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { formatDate } from "@/lib/utils";
import { deleteExamAction } from "./actions";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const { class: classFilter } = await searchParams;
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  let query = supabase
    .from("exams")
    .select("*, classes(class_name), subjects(name)")
    .order("exam_date", { ascending: false });
  if (selected) query = query.eq("academic_year_id", selected.id);
  if (classFilter) query = query.eq("class_id", classFilter);

  const { data: exams } = await query;
  type ExamRow = {
    id: string;
    name: string;
    term: string | null;
    exam_date: string | null;
    total_marks: number;
    classes: { class_name: string } | null;
    subjects: { name: string } | null;
  };
  const list = (exams ?? []) as unknown as ExamRow[];

  const resultCounts = await Promise.all(
    list.map(async (e) => {
      const { count } = await supabase.from("exam_results").select("id", { count: "exact", head: true }).eq("exam_id", e.id);
      return { id: e.id, count: count ?? 0 };
    })
  );
  const countMap = new Map(resultCounts.map((r) => [r.id, r.count]));

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exams & Results" }]} />
      <PageHeader
        title="Exams & Results"
        description="Create exams, enter marks and review class performance."
        action={
          <Link
            href="/exams/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Exam
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState title="No exams yet" description="Create your first exam to start recording results." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Results</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{e.name}</td>
                  <td className="px-4 py-3">{e.classes?.class_name ?? "—"}</td>
                  <td className="px-4 py-3">{e.subjects?.name ?? "—"}</td>
                  <td className="px-4 py-3">{e.term ?? "—"}</td>
                  <td className="px-4 py-3">{formatDate(e.exam_date)}</td>
                  <td className="px-4 py-3">{e.total_marks}</td>
                  <td className="px-4 py-3">{countMap.get(e.id) ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/exams/${e.id}/marks`}
                        title="Enter marks"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <ClipboardEdit size={15} />
                      </Link>
                      <Link
                        href={`/exams/${e.id}/edit`}
                        title="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil size={15} />
                      </Link>
                      <form action={deleteExamAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <ConfirmButton
                          message={`Delete exam "${e.name}"? All recorded results will be removed too.`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
