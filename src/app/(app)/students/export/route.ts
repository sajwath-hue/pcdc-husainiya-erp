import { createClient } from "@/lib/supabase/server";
import { getAcademicYearContext } from "@/lib/data/academic-year";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const supabase = await createClient();
  const { selected } = await getAcademicYearContext();

  let query = supabase
    .from("students")
    .select("student_id, admission_no, full_name, gender, dob, roll_no, status, class_id, guardian_name, guardian_phone")
    .order("full_name");
  if (selected) query = query.eq("academic_year_id", selected.id);

  const { data: students } = await query;
  const { data: classes } = await supabase.from("classes").select("id, class_name");
  const classById = new Map((classes ?? []).map((c) => [c.id, c.class_name]));

  const headers = [
    "student_id",
    "admission_no",
    "full_name",
    "gender",
    "dob",
    "roll_no",
    "status",
    "class_name",
    "guardian_name",
    "guardian_phone",
  ];
  const rows = (students ?? []).map((s) =>
    [
      s.student_id,
      s.admission_no,
      s.full_name,
      s.gender,
      s.dob,
      s.roll_no,
      s.status,
      classById.get(s.class_id) ?? "",
      s.guardian_name,
      s.guardian_phone,
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=students-${selected?.year_label ?? "export"}.csv`,
    },
  });
}
