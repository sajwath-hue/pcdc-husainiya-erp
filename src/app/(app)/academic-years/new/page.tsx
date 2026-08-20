import { Breadcrumb, PageHeader } from "@/components/ui/PageHeader";
import { AcademicYearForm } from "../AcademicYearForm";

export default function NewAcademicYearPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academic Years", href: "/academic-years" },
          { label: "New" },
        ]}
      />
      <PageHeader title="Add Academic Year" description="Create a new school session." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AcademicYearForm />
      </div>
    </div>
  );
}
