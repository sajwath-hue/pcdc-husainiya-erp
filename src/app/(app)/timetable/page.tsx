import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { addSlotAction, deleteSlotAction } from "./actions";
import type { ClassRow, Subject, Teacher } from "@/lib/types";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const { class: classId } = await searchParams;
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("academic_year_id", selected?.id ?? "")
    .order("class_name");
  const classList = (classes ?? []) as ClassRow[];
  const activeClassId = classId || classList[0]?.id;

  const [{ data: subjects }, { data: teachers }] = await Promise.all([
    supabase.from("subjects").select("*").order("name"),
    supabase.from("teachers").select("*").eq("status", "active").order("full_name"),
  ]);
  const subjectList = (subjects ?? []) as Subject[];
  const teacherList = (teachers ?? []) as Teacher[];
  const subjectById = new Map(subjectList.map((s) => [s.id, s.name]));
  const teacherById = new Map(teacherList.map((t) => [t.id, t.full_name]));

  let slots: { id: string; day_of_week: number; period: number; subject_id: string | null; teacher_id: string | null; start_time: string | null; end_time: string | null }[] = [];
  if (activeClassId) {
    const { data } = await supabase
      .from("timetable_slots")
      .select("*")
      .eq("class_id", activeClassId)
      .order("period");
    slots = data ?? [];
  }

  const maxPeriod = Math.max(6, ...slots.map((s) => s.period));
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);
  const slotAt = (day: number, period: number) => slots.find((s) => s.day_of_week === day && s.period === period);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Timetable" }]} />
      <PageHeader title="Timetable" description="Weekly period schedule by class." />

      <form className="flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Class</label>
          <select name="class" defaultValue={activeClassId ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Load
        </button>
      </form>

      {classList.length === 0 ? (
        <EmptyState title="No classes yet" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Period</th>
                  {DAYS.map((d) => (
                    <th key={d.value} className="px-4 py-3">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periods.map((p) => (
                  <tr key={p}>
                    <td className="px-4 py-3 font-medium text-slate-700">{p}</td>
                    {DAYS.map((d) => {
                      const slot = slotAt(d.value, p);
                      return (
                        <td key={d.value} className="px-4 py-3 align-top">
                          {slot ? (
                            <div className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-800">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">{subjectById.get(slot.subject_id ?? "") ?? "—"}</span>
                                <form action={deleteSlotAction}>
                                  <input type="hidden" name="id" value={slot.id} />
                                  <ConfirmButton message="Remove this slot?" className="text-blue-400 hover:text-red-600">
                                    <Trash2 size={12} />
                                  </ConfirmButton>
                                </form>
                              </div>
                              <p className="text-blue-600">{teacherById.get(slot.teacher_id ?? "") ?? ""}</p>
                              {slot.start_time && (
                                <p className="text-[10px] text-blue-400">
                                  {slot.start_time.slice(0, 5)}–{slot.end_time?.slice(0, 5)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Add a period slot</h3>
            <form action={addSlotAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="class_id" value={activeClassId ?? ""} />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Day</label>
                <select name="day_of_week" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Period</label>
                <input type="number" name="period" min={1} max={12} required defaultValue={1} className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
                <select name="subject_id" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">—</option>
                  {subjectList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Teacher</label>
                <select name="teacher_id" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">—</option>
                  {teacherList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Start</label>
                <input type="time" name="start_time" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">End</label>
                <input type="time" name="end_time" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Add slot
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
