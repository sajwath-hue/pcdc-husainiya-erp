import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { TeacherForm } from "../TeacherForm";
import type { ClassRow, Subject } from "@/lib/types";

export default async function NewTeacherPage() {
  const supabase = await createClient();
  const [{ data: subjects }, { data: classes }] = await Promise.all([
    supabase.from("subjects").select("*").order("name"),
    supabase.from("classes").select("*").order("class_name"),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Teachers", href: "/teachers" },
          { label: "New" },
        ]}
      />
      <PageHeader title="Add Teacher" description="Create a new faculty profile." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <TeacherForm subjects={(subjects ?? []) as Subject[]} classes={(classes ?? []) as ClassRow[]} />
      </div>
    </div>
  );
}
