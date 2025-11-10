import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';

// Bundle analyzer
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone', // ✅ Re-habilitado para producción
  
  // Configuración de Turbopack (silenciar warning de workspace root)
  outputFileTracingRoot: path.join(__dirname, '../'),
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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
    // Habilitar optimizaciones de imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-avatar',
      '@radix-ui/react-slot',
      'react-chartjs-2',
      'date-fns',
    ],
  },
  
  // Optimización de Webpack
  webpack: (config, { isServer }) => {
    // Optimizaciones de producción
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk para librerías grandes
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Chunk separado para librerías pesadas
            lib: {
              test: /[\\/]node_modules[\\/](leaflet|react-leaflet|chart\.js|react-chartjs-2)[\\/]/,
              name: 'lib',
              chunks: 'async',
              priority: 30,
            },
            // Chunk para reportes (jspdf, xlsx)
            reports: {
              test: /[\\/]node_modules[\\/](jspdf|jspdf-autotable|xlsx)[\\/]/,
              name: 'reports',
              chunks: 'async',
              priority: 40,
            },
            // Chunk para Sentry (solo en producción, lazy loaded)
            sentry: {
              test: /[\\/]node_modules[\\/](@sentry)[\\/]/,
              name: 'sentry',
              chunks: 'async',
              priority: 35,
            },
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
