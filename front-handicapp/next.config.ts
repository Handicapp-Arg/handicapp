import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracing: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dh2m9ychv/**',
      },
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
};

export default nextConfig;
