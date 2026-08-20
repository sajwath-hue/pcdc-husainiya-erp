import { Trash2, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubjectForm } from "./SubjectForm";
import { deleteSubjectAction } from "./actions";
import type { Subject } from "@/lib/types";

export default async function SubjectsPage() {
  const supabase = await createClient();
  const { data: subjects } = await supabase.from("subjects").select("*").order("name");
  const list = (subjects ?? []) as Subject[];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]} />
      <PageHeader title="Subjects" description="The subject list used across teachers, exams and timetables." />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SubjectForm />
      </div>

      {list.length === 0 ? (
        <EmptyState title="No subjects yet" description="Add subjects like Arabic, Quran Studies, Fiqh, English, Mathematics..." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <BookOpen size={15} className="text-blue-500" /> {s.name}
              </span>
              <form action={deleteSubjectAction}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmButton
                  message={`Remove subject "${s.name}"?`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50"
                >
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
