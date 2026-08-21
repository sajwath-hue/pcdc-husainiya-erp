import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { ClassForm } from "../../ClassForm";
import type { ClassRow } from "@/lib/types";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: classRow } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();
  if (!classRow) notFound();

  const { years } = await getAcademicYearContext();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Classes", href: "/classes" },
          { label: "Edit" },
        ]}
      />
      <PageHeader title={`Edit ${classRow.class_name}`} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ClassForm years={years} classRow={classRow as ClassRow} />
      </div>
    </div>
  );
}
