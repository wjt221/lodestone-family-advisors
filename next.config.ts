import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The app lives in a subdirectory of a larger repo; pin the workspace root
  // so Next.js does not infer it from a sibling lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Document uploads go through a server action; default is 1 MB.
      bodySizeLimit: "26mb",
    },
  },
};

export default nextConfig;
