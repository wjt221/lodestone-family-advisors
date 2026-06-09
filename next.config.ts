import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The app lives in a subdirectory of a larger repo; pin the workspace root
  // so Next.js does not infer it from a sibling lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
