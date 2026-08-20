import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle so the Electron desktop app
  // can run it without needing node_modules installed on the user's machine.
  output: "standalone",
};

export default nextConfig;
