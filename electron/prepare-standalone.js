// Next.js's `output: "standalone"` build doesn't include the `public/`
// folder or `.next/static` (see https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
// — copy them in so the standalone server can serve the full app on its own.
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error('.next/standalone not found — run "next build" first.');
  process.exit(1);
}

fs.cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), { recursive: true });
fs.cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), {
  recursive: true,
});

console.log("Copied public/ and .next/static into .next/standalone for packaging.");
