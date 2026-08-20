import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { FeeForm } from "../FeeForm";
import type { Student } from "@/lib/types";

export default async function NewFeePage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student } = await searchParams;
  const supabase = await createClient();
  const { years, selected } = await getAcademicYearContext();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("academic_year_id", selected?.id ?? "")
    .order("full_name");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Fees", href: "/fees" },
          { label: "New" },
        ]}
      />
      <PageHeader title="Add Fee Record" description="Bill a student for tuition or another fee type." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FeeForm students={(students ?? []) as Student[]} years={years} selectedYearId={selected?.id} studentId={student} />
      </div>
    </div>
  );
}
