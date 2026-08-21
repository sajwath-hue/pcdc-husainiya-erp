// Next.js's `output: "standalone"` build doesn't include the `public/`
// folder or `.next/static` (see https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
// — copy them in, then archive the whole thing as one file.
//
// It has to be a single archive (not a plain directory) because
// electron-builder's file collector applies npm-dependency-aware pruning to
// any directory literally named "node_modules" it finds while packaging —
// including ones nested deep inside `extraResources`, like this standalone
// server's own bundled node_modules. That pruning doesn't understand a
// dependency tree it didn't build (Next's build tracer's output isn't a
// real npm project), so it silently strips the whole folder empty. Shipping
// one opaque .tar.gz file sidesteps that entirely; electron/main.js
// extracts it with the OS's own `tar` on first launch.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");
const resourcesDir = path.join(__dirname, "resources");
const archivePath = path.join(resourcesDir, "standalone.tar.gz");

if (!fs.existsSync(standaloneDir)) {
  console.error('.next/standalone not found — run "next build" first.');
  process.exit(1);
}

fs.cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), { recursive: true });
fs.cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), {
  recursive: true,
});

// NEXT_PUBLIC_* vars get inlined into the browser bundle at build time, but
// server-rendered pages (e.g. the login page's "is Supabase configured?"
// check) read process.env live at runtime — Next's standalone server.js
// loads .env* files from its own directory on startup, so write one here
// with whatever values this build was run with, matching the browser bundle.
const envVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  .filter((key) => process.env[key])
  .map((key) => `${key}=${process.env[key]}`)
  .join("\n");
if (envVars) {
  fs.writeFileSync(path.join(standaloneDir, ".env.production.local"), envVars + "\n");
}

fs.mkdirSync(resourcesDir, { recursive: true });
if (fs.existsSync(archivePath)) fs.rmSync(archivePath);

execFileSync("tar", ["-czf", archivePath, "-C", path.join(root, ".next"), "standalone"]);

console.log(`Packed .next/standalone into ${path.relative(root, archivePath)}`);
