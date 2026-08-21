import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle so the Electron desktop app and
  // the local-server zip can run it without needing node_modules installed
  // on the user's machine. Skipped on Vercel — "standalone" output isn't
  // compatible with how Vercel packages its own serverless functions, and
  // isn't needed there since Vercel does its own bundling.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
