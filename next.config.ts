import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. "/pictionary-phrase-generator"

const nextConfig: NextConfig = {
  // Enable static export so it works on GitHub Pages
  output: "export",
  // Optional: set when deploying to a project page under a subpath
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
