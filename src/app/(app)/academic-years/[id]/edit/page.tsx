import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { AcademicYearForm } from "../../AcademicYearForm";
import type { AcademicYear } from "@/lib/types";

export default async function EditAcademicYearPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: year } = await supabase.from("academic_years").select("*").eq("id", id).maybeSingle();

  if (!year) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academic Years", href: "/academic-years" },
          { label: "Edit" },
        ]}
      />
      <PageHeader title={`Edit ${year.year_label}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AcademicYearForm year={year as AcademicYear} />
      </div>
    </div>
  );
}
