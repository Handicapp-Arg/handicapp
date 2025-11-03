import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";
import withPWAInit from "@ducanh2912/next-pwa";

// PWA Configuration
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  sw: "service-worker.js",
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true, // Moved here
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-images",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail production builds on ESLint errors. We'll fix them progressively.
    ignoreDuringBuilds: true,
  },
  // Silence workspace root inference warning when using a monorepo-like structure
  outputFileTracingRoot: path.resolve(__dirname, ".."),

  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.your-domain.com',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Webpack optimizations for faster dev builds
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 🚀 MEJORA: Reducir module resolution time
      config.resolve.symlinks = false;
      
      // 🚀 MEJORA: Optimizar cache del filesystem
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        // 🆕 Aumentar memoria del cache
        maxMemoryGenerations: 10,
        compression: 'gzip',
      };
    }
    return config;
  },
  
  experimental: {
    // Activar server actions si se usan más adelante
    serverActions: { allowedOrigins: ["*"] },
    
    // 🚀 MEJORA: Optimize package imports - TREE SHAKING + Barrel Exports
    optimizePackageImports: [
      "@tanstack/react-query",
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@/lib/hooks",              // 🆕 Optimizar hooks (ahorra ~2s compilación)
      "@/lib/services",           // 🆕 Optimizar services
      "@/components/ui",          // 🆕 Optimizar UI components
    ],
    
    // Optimize CSS
    optimizeCss: true,
  },
  
  // 🚀 MEJORA: Modularize imports para tree-shaking agresivo
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  
  // Turbopack configuration (nueva sintaxis)
  turbopack: {
    resolveAlias: {
      // Reduce module resolution
      underscore: 'lodash',
    },
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

// Wrap Next.js config with PWA and Sentry
export default withSentryConfig(withPWA(nextConfig), sentryWebpackPluginOptions);
