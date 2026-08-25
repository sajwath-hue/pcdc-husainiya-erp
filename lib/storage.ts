import { mkdir, writeFile, readFile as fsReadFile } from "fs/promises";
import path from "path";

// All generated PDFs and uploaded signed agreements live under this
// directory (gitignored, created on demand). Never serve it as a static
// public folder — files are streamed back through authenticated API
// routes only (see app/api/files/[...segments]/route.ts).
export const STORAGE_ROOT = path.join(process.cwd(), "storage");

function safeSegment(segment: string): string {
  const cleaned = segment.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!cleaned || cleaned === "." || cleaned === "..") {
    throw new Error("Invalid path segment");
  }
  return cleaned;
}

/** Writes a file under storage/<subdir>/<filename> and returns the path relative to STORAGE_ROOT. */
export async function saveFile(subdir: string, filename: string, data: Buffer): Promise<string> {
  const dirSegments = subdir.split("/").map(safeSegment);
  const fileSegment = safeSegment(filename);
  const dir = path.join(STORAGE_ROOT, ...dirSegments);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, fileSegment);
  await writeFile(fullPath, data);
  return path.join(...dirSegments, fileSegment);
}

/** Reads a file previously saved with saveFile, given its path relative to STORAGE_ROOT. */
export async function readStoredFile(relativePath: string): Promise<Buffer> {
  const segments = relativePath.split(/[/\\]/).map(safeSegment);
  const fullPath = path.join(STORAGE_ROOT, ...segments);
  if (!fullPath.startsWith(STORAGE_ROOT)) {
    throw new Error("Path traversal rejected");
  }
  return fsReadFile(fullPath);
}

export function extensionFor(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "image/png":
      return "png";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    default:
      return "bin";
  }
}
