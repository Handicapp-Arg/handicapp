import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Activar server actions si se usan más adelante
    serverActions: { allowedOrigins: ["*"] },
  },
};

export default nextConfig;
