import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail production builds on ESLint errors. We'll fix them progressively.
    ignoreDuringBuilds: true,
  },
  // Silence workspace root inference warning when using a monorepo-like structure
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  experimental: {
    // Activar server actions si se usan más adelante
    serverActions: { allowedOrigins: ["*"] },
  },
};

export default nextConfig;
