import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@xenova/transformers"],
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
