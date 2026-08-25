import { NextResponse } from "next/server";
import { requireUser, authErrorResponse } from "@/lib/auth/rbac";
import { readStoredFile } from "@/lib/storage";

function contentTypeFor(filename: string): string {
  if (filename.endsWith(".pdf")) return "application/pdf";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

// Every stored document (generated agreements, signed uploads, notices) is
// only ever served through this authenticated route — storage/ is not a
// public/static directory.
export async function GET(request: Request, context: { params: Promise<{ segments: string[] }> }) {
  try {
    await requireUser();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { segments } = await context.params;
  const relativePath = segments.join("/");

  try {
    const buffer = await readStoredFile(relativePath);
    const url = new URL(request.url);
    const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor(relativePath),
        "Content-Disposition": `${disposition}; filename="${segments[segments.length - 1]}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
