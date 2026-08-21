import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { extractTotalMarks, formatDate, formatPKR, percentageToGrade } from "@/lib/utils";
import type { ClassRow, Student } from "@/lib/types";
import { format, type Dictionary } from "@/lib/i18n";
import {
  addBehaviorAction,
  addDocumentAction,
  addRemarkAction,
  deleteBehaviorAction,
  deleteDocumentAction,
  deleteRemarkAction,
} from "./actions";

const cellClass = "px-4 py-3";
const theadClass = "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500";

export async function OverviewTab({ student, cls, t }: { student: Student; cls: ClassRow | null; t: Dictionary }) {
  const supabase = await createClient();
  const [{ data: remark }, { data: enrollmentYear }] = await Promise.all([
    supabase
      .from("teacher_remarks")
      .select("remark, remark_date")
      .eq("student_id", student.id)
      .order("remark_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    student.academic_year_id
      ? supabase.from("academic_years").select("year_label").eq("id", student.academic_year_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.students.personalInformation}</h3>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Info label={t.students.fullName} value={student.full_name} />
            <Info label={t.students.dateOfBirth} value={formatDate(student.dob)} />
            <Info label={t.students.gender} value={student.gender ?? "—"} />
            <Info label={t.students.bloodGroup} value={student.blood_group ?? "—"} />
            <Info label={t.students.studentId} value={student.student_id} />
            <Info label={t.students.admissionNo} value={student.admission_no ?? "—"} />
            <Info label={t.students.currentClass} value={cls?.class_name ?? t.common.unassigned} />
            <Info label={t.classHub.academicYear} value={enrollmentYear?.year_label ?? "—"} />
          </dl>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.students.guardianInformation}</h3>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Info label={t.students.guardian} value={student.guardian_name ?? "—"} />
            <Info label={t.students.guardianPhone} value={student.guardian_phone ?? "—"} />
            <Info label={t.students.guardianEmail} value={student.guardian_email ?? "—"} />
            <Info label={t.students.address} value={student.address ?? "—"} />
          </dl>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.students.enrollmentHistory}</h3>
          <p className="text-sm font-medium text-slate-700">{enrollmentYear?.year_label ?? "—"}</p>
          <p className="text-xs text-slate-500">
            {cls?.class_name ?? t.common.unassigned} · {format(t.students.rollNumber, { no: student.roll_no ?? "—" })}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.students.latestTeacherRemark}</h3>
          {remark ? (
            <>
              <p className="text-sm text-slate-700">{remark.remark}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(remark.remark_date)}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">{t.studentTabs.noTeacherRemarks}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
    </div>
  );
}

export function ProfileTab({ student, t }: { student: Student; t: Dictionary }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{t.students.fullProfile}</h3>
        <Link href={`/students/${student.id}/edit`} className="text-sm font-medium text-blue-600 hover:underline">
          {t.students.editProfile}
        </Link>
      </div>
      <dl className="grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2">
        <Info label={t.students.fullName} value={student.full_name} />
        <Info label={t.students.studentId} value={student.student_id} />
        <Info label={t.students.admissionNo} value={student.admission_no ?? "—"} />
        <Info label={t.students.dateOfBirth} value={formatDate(student.dob)} />
        <Info label={t.students.gender} value={student.gender ?? "—"} />
        <Info label={t.students.bloodGroup} value={student.blood_group ?? "—"} />
        <Info label={t.students.rollNoDot} value={String(student.roll_no ?? "—")} />
        <Info label={t.common.status} value={student.status === "active" ? t.common.active : t.common.inactive} />
        <Info label={t.students.guardian} value={student.guardian_name ?? "—"} />
        <Info label={t.students.guardianPhone} value={student.guardian_phone ?? "—"} />
        <Info label={t.students.guardianEmail} value={student.guardian_email ?? "—"} />
        <Info label={t.students.address} value={student.address ?? "—"} />
      </dl>
    </div>
  );
}

export async function AttendanceTab({ studentId, t }: { studentId: string; t: Dictionary }) {
  const supabase = await createClient();
  const { data: records } = await supabase
    .from("attendance")
    .select("date, status")
    .eq("student_id", studentId)
    .order("date", { ascending: false })
    .limit(60);

  const rows = records ?? [];
  if (rows.length === 0) {
    return <EmptyPanel text={t.studentTabs.noAttendanceRecorded} />;
  }

  const statusLabel = (status: string) =>
    (t.attendance as Record<string, string>)[status] ?? status;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className={theadClass}>
          <tr>
            <th className={cellClass}>{t.common.date}</th>
            <th className={cellClass}>{t.common.status}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={i}>
              <td className={cellClass}>{formatDate(r.date)}</td>
              <td className={cellClass}>
                <Badge tone={r.status}>{statusLabel(r.status)}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function ExamsTab({ classId, t }: { classId: string | null; t: Dictionary }) {
  if (!classId) return <EmptyPanel text={t.studentTabs.notAssignedToClass} />;

  const supabase = await createClient();
  const { data: exams } = await supabase
    .from("exams")
    .select("*, subjects(name)")
    .eq("class_id", classId)
    .order("exam_date", { ascending: false });

  const rows = (exams ?? []) as unknown as { id: string; name: string; term: string | null; exam_date: string | null; total_marks: number; subjects: { name: string } | null }[];
  if (rows.length === 0) return <EmptyPanel text={t.studentTabs.noExamsScheduled} />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className={theadClass}>
          <tr>
            <th className={cellClass}>{t.studentTabs.examCol}</th>
            <th className={cellClass}>{t.common.subject}</th>
            <th className={cellClass}>{t.exams.term}</th>
            <th className={cellClass}>{t.common.date}</th>
            <th className={cellClass}>{t.exams.totalMarks}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((e) => (
            <tr key={e.id}>
              <td className={cellClass}>{e.name}</td>
              <td className={cellClass}>{e.subjects?.name ?? "—"}</td>
              <td className={cellClass}>{e.term ?? "—"}</td>
              <td className={cellClass}>{formatDate(e.exam_date)}</td>
              <td className={cellClass}>{e.total_marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function ResultsTab({ studentId, t }: { studentId: string; t: Dictionary }) {
  const supabase = await createClient();
  const { data: results } = await supabase
    .from("exam_results")
    .select("marks_obtained, exams(name, term, total_marks, subjects(name))")
    .eq("student_id", studentId);

  type ResultRow = {
    marks_obtained: number;
    exams: { name: string; term: string | null; total_marks: number; subjects: { name: string } | null } | null;
  };
  const rows = (results ?? []) as unknown as ResultRow[];
  if (rows.length === 0) return <EmptyPanel text={t.studentTabs.noResultsRecorded} />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className={theadClass}>
          <tr>
            <th className={cellClass}>{t.common.subject}</th>
            <th className={cellClass}>{t.studentTabs.examCol}</th>
            <th className={cellClass}>{t.studentTabs.marksCol}</th>
            <th className={cellClass}>{t.common.total}</th>
            <th className={cellClass}>{t.common.percentage}</th>
            <th className={cellClass}>{t.common.grade}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => {
            const total = r.exams?.total_marks || 100;
            const pct = Math.round((Number(r.marks_obtained) / total) * 1000) / 10;
            return (
              <tr key={i}>
                <td className={cellClass}>{r.exams?.subjects?.name ?? "—"}</td>
                <td className={cellClass}>
                  {r.exams?.name} {r.exams?.term ? `(${r.exams.term})` : ""}
                </td>
                <td className={cellClass}>{r.marks_obtained}</td>
                <td className={cellClass}>{total}</td>
                <td className={cellClass}>{pct}%</td>
                <td className={cellClass}>
                  <Badge tone="active">{percentageToGrade(pct)}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export async function AssignmentsTab({ classId, t }: { classId: string | null; t: Dictionary }) {
  if (!classId) return <EmptyPanel text={t.studentTabs.notAssignedToClass} />;

  const supabase = await createClient();
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, subjects(name)")
    .eq("class_id", classId)
    .order("due_date", { ascending: false });

  const rows = (assignments ?? []) as unknown as { id: string; title: string; description: string | null; due_date: string | null; subjects: { name: string } | null }[];
  if (rows.length === 0) return <EmptyPanel text={t.studentTabs.noAssignmentsForClass} />;

  return (
    <div className="space-y-3">
      {rows.map((a) => (
        <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-800">{a.title}</p>
            <span className="text-xs text-slate-400">{format(t.studentTabs.dueLabel, { date: formatDate(a.due_date) })}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{a.subjects?.name ?? t.studentTabs.generalSubject}</p>
          {a.description && <p className="mt-2 text-sm text-slate-600">{a.description}</p>}
        </div>
      ))}
    </div>
  );
}

export async function FeesTab({ studentId, t }: { studentId: string; t: Dictionary }) {
  const supabase = await createClient();
  const { data: fees } = await supabase
    .from("fees")
    .select("*")
    .eq("student_id", studentId)
    .order("due_date", { ascending: false });

  const rows = fees ?? [];
  const statusLabel = (status: string) =>
    status === "paid" ? t.fees.paid : (t.dashboard as Record<string, string>)[status] ?? status;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link
          href={`/fees/new?student=${studentId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={15} /> {t.fees.newTitle}
        </Link>
      </div>
      {rows.length === 0 ? (
        <EmptyPanel text={t.studentTabs.noFeeRecords} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={cellClass}>{t.studentTabs.typeCol}</th>
                <th className={cellClass}>{t.common.amount}</th>
                <th className={cellClass}>{t.fees.paid}</th>
                <th className={cellClass}>{t.common.dueDate}</th>
                <th className={cellClass}>{t.common.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((f) => (
                <tr key={f.id}>
                  <td className={cellClass}>{f.fee_type}</td>
                  <td className={cellClass}>{formatPKR(f.amount)}</td>
                  <td className={cellClass}>{formatPKR(f.amount_paid)}</td>
                  <td className={cellClass}>{formatDate(f.due_date)}</td>
                  <td className={cellClass}>
                    <Badge tone={f.status}>{statusLabel(f.status)}</Badge>
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

export async function BehaviorTab({ studentId, t }: { studentId: string; t: Dictionary }) {
  const supabase = await createClient();
  const { data: records } = await supabase
    .from("behavior_records")
    .select("*")
    .eq("student_id", studentId)
    .order("record_date", { ascending: false });

  const typeLabel = (type: string) =>
    (t.studentTabs as Record<string, string>)[type] ?? type;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.studentTabs.logBehavior}</h3>
        <form action={addBehaviorAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="student_id" value={studentId} />
          <select name="type" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue="neutral">
            <option value="positive">{t.studentTabs.positive}</option>
            <option value="neutral">{t.studentTabs.neutral}</option>
            <option value="negative">{t.studentTabs.negative}</option>
          </select>
          <input
            type="text"
            name="description"
            required
            placeholder={t.studentTabs.whatHappened}
            className="min-w-64 flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {t.studentTabs.log}
          </button>
        </form>
      </div>

      {(records ?? []).length === 0 ? (
        <EmptyPanel text={t.studentTabs.noBehaviorRecords} />
      ) : (
        <div className="space-y-2">
          {(records ?? []).map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <Badge tone={b.type === "positive" ? "active" : b.type === "negative" ? "overdue" : "pending"}>{typeLabel(b.type)}</Badge>
                <p className="mt-1 text-sm text-slate-700">{b.description}</p>
                <p className="text-xs text-slate-400">{formatDate(b.record_date)}</p>
              </div>
              <form action={deleteBehaviorAction}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="student_id" value={studentId} />
                <ConfirmButton message={t.studentTabs.confirmRemoveRecord} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50">
                  <Trash2 size={14} />
                </ConfirmButton>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function RemarksTab({ studentId, t }: { studentId: string; t: Dictionary }) {
  const supabase = await createClient();
  const { data: remarks } = await supabase
    .from("teacher_remarks")
    .select("*, teachers(full_name)")
    .eq("student_id", studentId)
    .order("remark_date", { ascending: false });

  type RemarkRow = { id: string; remark: string; remark_date: string; teachers: { full_name: string } | null };
  const rows = (remarks ?? []) as unknown as RemarkRow[];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.students.addRemark}</h3>
        <form action={addRemarkAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="student_id" value={studentId} />
          <input
            type="text"
            name="remark"
            required
            placeholder={t.studentTabs.remarkPlaceholder}
            className="min-w-64 flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {t.students.addRemark}
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyPanel text={t.studentTabs.noTeacherRemarks} />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm text-slate-700">{r.remark}</p>
                <p className="text-xs text-slate-400">
                  {r.teachers?.full_name ?? t.studentTabs.staffFallback} · {formatDate(r.remark_date)}
                </p>
              </div>
              <form action={deleteRemarkAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="student_id" value={studentId} />
                <ConfirmButton message={t.studentTabs.confirmDeleteRemark} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50">
                  <Trash2 size={14} />
                </ConfirmButton>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function DocumentsTab({ studentId, t }: { studentId: string; t: Dictionary }) {
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("student_documents")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">{t.studentTabs.addDocumentReference}</h3>
        <form action={addDocumentAction} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input type="hidden" name="student_id" value={studentId} />
          <input type="text" name="name" required placeholder={t.studentTabs.documentNamePlaceholder} className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm sm:col-span-1" />
          <input type="url" name="file_url" placeholder={t.studentTabs.linkOptional} className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm sm:col-span-1" />
          <div className="flex gap-2 sm:col-span-1">
            <input type="text" name="notes" placeholder={t.studentTabs.notesPlaceholder} className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              {t.common.add}
            </button>
          </div>
        </form>
      </div>

      {(docs ?? []).length === 0 ? (
        <EmptyPanel text={t.studentTabs.noDocumentsOnFile} />
      ) : (
        <div className="space-y-2">
          {(docs ?? []).map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {d.file_url ? (
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {d.name}
                    </a>
                  ) : (
                    d.name
                  )}
                </p>
                {d.notes && <p className="text-xs text-slate-400">{d.notes}</p>}
              </div>
              <form action={deleteDocumentAction}>
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="student_id" value={studentId} />
                <ConfirmButton message={t.studentTabs.confirmRemoveDocument} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50">
                  <Trash2 size={14} />
                </ConfirmButton>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function YearlyReportTab({ student, t }: { student: Student; t: Dictionary }) {
  const supabase = await createClient();
  const { data: attendance } = await supabase.from("attendance").select("status").eq("student_id", student.id);
  const total = attendance?.length ?? 0;
  const present = attendance?.filter((a) => a.status === "present" || a.status === "late").length ?? 0;

  const { data: results } = await supabase
    .from("exam_results")
    .select("marks_obtained, exams(total_marks)")
    .eq("student_id", student.id);
  const pcts = (results ?? []).map((r) => {
    const total = extractTotalMarks(r.exams);
    return total ? (Number(r.marks_obtained) / total) * 100 : 0;
  });
  const avg = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;

  const { data: fees } = await supabase.from("fees").select("amount, amount_paid").eq("student_id", student.id);
  const totalFees = (fees ?? []).reduce((s, f) => s + Number(f.amount), 0);
  const paidFees = (fees ?? []).reduce((s, f) => s + Number(f.amount_paid), 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ReportCard
        label={t.students.attendance}
        value={total ? `${Math.round((present / total) * 1000) / 10}%` : "—"}
        sub={format(t.studentTabs.attendanceSub, { present, total })}
      />
      <ReportCard
        label={t.students.academicAverage}
        value={`${Math.round(avg * 10) / 10}%`}
        sub={format(t.studentTabs.gradeSub, { grade: percentageToGrade(avg) })}
      />
      <ReportCard label={t.studentTabs.examsTaken} value={String(results?.length ?? 0)} sub={t.studentTabs.thisAcademicYear} />
      <ReportCard label={t.students.fees} value={formatPKR(paidFees)} sub={format(t.studentTabs.feesBilledSub, { total: formatPKR(totalFees) })} />
    </div>
  );
}

function ReportCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}
