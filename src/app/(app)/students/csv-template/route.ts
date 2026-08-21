export function GET() {
  const csv = [
    "full_name,admission_no,gender,dob,roll_no,class_name,guardian_name,guardian_phone",
    "Ali Khan,ADM-2026-1,Male,2014-01-12,1,Class 1-A,Khan Sahib,03001234567",
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=students-template.csv",
    },
  });
}
