import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { formatDate, formatPKR } from "@/lib/utils";
import { RecordPayment } from "./RecordPayment";
import { deleteFeeAction } from "./actions";

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; status?: string }>;
}) {
  const { class: classFilter, status } = await searchParams;
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  let query = supabase
    .from("fees")
    .select("*, students(full_name, class_id, classes(class_name))")
    .order("due_date", { ascending: true });
  if (selected) query = query.eq("academic_year_id", selected.id);
  if (status) query = query.eq("status", status);

  const { data: fees } = await query;
  type FeeRow = {
    id: string;
    fee_type: string;
    amount: number;
    amount_paid: number;
    due_date: string | null;
    status: "paid" | "pending" | "overdue";
    students: { full_name: string; class_id: string | null; classes: { class_name: string } | null } | null;
  };
  let list = (fees ?? []) as unknown as FeeRow[];
  if (classFilter) list = list.filter((f) => f.students?.class_id === classFilter);

  const totalExpected = list.reduce((s, f) => s + Number(f.amount), 0);
  const totalCollected = list.reduce((s, f) => s + Number(f.amount_paid), 0);
  const totalPending = list.filter((f) => f.status !== "paid").reduce((s, f) => s + (Number(f.amount) - Number(f.amount_paid)), 0);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fees" }]} />
      <PageHeader
        title="Fees"
        description="Track tuition and other fee payments by student."
        action={
          <Link
            href="/fees/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add Fee Record
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Billed" value={formatPKR(totalExpected)} />
        <StatCard label="Collected" value={formatPKR(totalCollected)} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Outstanding" value={formatPKR(totalPending)} accent="bg-amber-50 text-amber-600" />
      </div>

      <form className="flex gap-3">
        {classFilter && <input type="hidden" name="class" value={classFilter} />}
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm">
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <button type="submit" className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Filter
        </button>
      </form>

      {list.length === 0 ? (
        <EmptyState title="No fee records" description="Add a fee record for a student to start tracking payments." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{f.students?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{f.students?.classes?.class_name ?? "—"}</td>
                  <td className="px-4 py-3">{f.fee_type}</td>
                  <td className="px-4 py-3">{formatPKR(f.amount)}</td>
                  <td className="px-4 py-3">{formatPKR(f.amount_paid)}</td>
                  <td className="px-4 py-3">{formatDate(f.due_date)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={f.status}>{f.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <RecordPayment feeId={f.id} balance={Number(f.amount) - Number(f.amount_paid)} />
                      <form action={deleteFeeAction}>
                        <input type="hidden" name="id" value={f.id} />
                        <ConfirmButton
                          message="Delete this fee record?"
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
