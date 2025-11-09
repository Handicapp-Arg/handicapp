import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dh2m9ychv/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'handicapp-back.onrender.com',
        pathname: '/uploads/**',
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
