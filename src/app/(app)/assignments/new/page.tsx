import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { AssignmentForm } from "../AssignmentForm";
import type { ClassRow, Subject, Teacher } from "@/lib/types";

export default async function NewAssignmentPage() {
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();
  const [{ data: classes }, { data: subjects }, { data: teachers }] = await Promise.all([
    supabase.from("classes").select("*").eq("academic_year_id", selected?.id ?? "").order("class_name"),
    supabase.from("subjects").select("*").order("name"),
    supabase.from("teachers").select("*").eq("status", "active").order("full_name"),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assignments", href: "/assignments" },
          { label: "New" },
        ]}
      />
      <PageHeader title="Add Assignment" description="Assign classwork to a class." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AssignmentForm
          classes={(classes ?? []) as ClassRow[]}
          subjects={(subjects ?? []) as Subject[]}
          teachers={(teachers ?? []) as Teacher[]}
        />
      </div>
    </div>
  );
}
