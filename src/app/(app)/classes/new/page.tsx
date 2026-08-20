import { getAcademicYearContext } from "@/lib/data/academic-year";
import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { ClassForm } from "../ClassForm";

export default async function NewClassPage() {
  const { years, selected } = await getAcademicYearContext();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Classes", href: "/classes" },
          { label: "New" },
        ]}
      />
      <PageHeader title="Add Class" description="Create a new class and section." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ClassForm years={years} selectedYearId={selected?.id} />
      </div>
    </div>
  );
}
