/**
 * 🚀 PERFORMANCE ANALYZER
 * Script para análisis profundo de bundle y performance
 */

'use client';

import { Suspense, lazy, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';

// 🚀 LAZY LOADING OPTIMIZADO
// Componentes pesados que solo cargan cuando se necesitan

// Charts con loading fallback optimizado
const OptimizedChart = lazy(() => 
  import('@/components/ui/chart').then(module => ({ 
    default: module.Chart 
  }))
);

const OptimizedBarChart = lazy(() =>
  import('recharts').then(module => ({
    default: module.BarChart
  }))
);

// PDF Viewer con dynamic loading
const OptimizedPDFViewer = dynamic(
  () => import('@/components/ui/pdf-viewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-500">Cargando PDF...</div>
      </div>
    )
  }
);

// Map component con lazy loading
const OptimizedMap = dynamic(
  () => import('@/components/ui/map'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }
);

// Image Gallery con intersection observer
const OptimizedImageGallery = dynamic(
  () => import('@/components/ui/image-gallery'),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }
);

// 🚀 HOC para lazy loading inteligente con intersection observer
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return memo((props: T) => (
    <Suspense fallback={fallback || <div className="animate-pulse bg-gray-100 h-32 rounded" />}>
      <Component {...props} />
    </Suspense>
  ));
}

// 🚀 ANÁLISIS DE BUNDLE SIZE
export const HEAVY_COMPONENTS = {
  // Componentes que impactan el bundle size
  CHARTS: {
    'recharts': '~400KB',
    'chart.js': '~250KB',
    '@tremor/react': '~180KB'
  },
  
  RICH_TEXT: {
    '@tiptap/react': '~150KB',
    'react-quill': '~200KB',
    'draft-js': '~300KB'
  },
  
  DATE_PICKERS: {
    'react-datepicker': '~120KB',
    '@mui/x-date-pickers': '~180KB'
  },
  
  PDF_VIEWERS: {
    'react-pdf': '~800KB',
    'pdf.js': '~1.2MB'
  },
  
  MAPS: {
    'react-leaflet': '~400KB',
    'google-maps-react': '~300KB'
  }
} as const;

// 🚀 OPTIMIZACIÓN DE TREE SHAKING
// Importaciones específicas para reducir bundle

// Lucide icons - import específico
export { 
  Home, 
  Users, 
  Settings,
  Activity,
  BarChart3
} from 'lucide-react';

// Lodash - importaciones específicas
export { debounce } from 'lodash-es/debounce';
export { throttle } from 'lodash-es/throttle';
export { uniq } from 'lodash-es/uniq';

// 🚀 CODE SPLITTING STRATEGIES
export const SPLIT_POINTS = {
  // Por rutas principales
  ADMIN_ROUTE: () => import('@/app/(dashboard)/admin/page'),
  ESTABLECIMIENTO_ROUTE: () => import('@/app/(dashboard)/establecimiento/page'),
  PROPIETARIO_ROUTE: () => import('@/app/(dashboard)/propietario/page'),
  
  // Por funcionalidad
  REPORTS_MODULE: () => import('@/components/reports'),
  FORMS_MODULE: () => import('@/components/forms'),
  TABLES_MODULE: () => import('@/components/tables'),
  
  // Librerías pesadas
  CHARTS_LIB: () => import('recharts'),
  PDF_LIB: () => import('react-pdf'),
  DATE_LIB: () => import('react-datepicker'),
} as const;

// 🚀 PERFORMANCE MONITORING
export interface PerformanceMetrics {
  bundleSize: number;
  chunkSizes: Record<string, number>;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

export class PerformanceAnalyzer {
  private metrics: Partial<PerformanceMetrics> = {};
  
  // Medir tiempo de carga inicial
  measureInitialLoad() {
    if (typeof window !== 'undefined') {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
    }
    return this;
  }
  
  // Medir memoria utilizada
  measureMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      // @ts-ignore
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }
    return this;
  }
  
  // Medir tiempo de renderizado
  measureRenderTime(componentName: string) {
    if (typeof window !== 'undefined') {
      const mark = `${componentName}-render-start`;
      performance.mark(mark);
      
      // Cleanup después del render
      requestIdleCallback(() => {
        const endMark = `${componentName}-render-end`;
        performance.mark(endMark);
        performance.measure(`${componentName}-render`, mark, endMark);
      });
    }
    return this;
  }
  
  // Obtener métricas Core Web Vitals
  getCoreWebVitals() {
    return new Promise<{
      LCP?: number;
      FID?: number;
      CLS?: number;
      FCP?: number;
    }>((resolve) => {
      const vitals: any = {};
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.LCP = entries[entries.length - 1].startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.FID = entries[0]?.processingStart - entries[0]?.startTime;
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.CLS = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
      
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.FCP = entries[0]?.startTime;
      }).observe({ entryTypes: ['paint'] });
      
      // Resolver después de 5 segundos para obtener métricas
      setTimeout(() => resolve(vitals), 5000);
    });
  }
  
  // Reporte completo de performance
  getReport(): PerformanceMetrics | null {
    if (typeof window === 'undefined') return null;
    
    return {
      bundleSize: 0, // Se calcula con webpack-bundle-analyzer
      chunkSizes: {}, // Se obtiene del build
      loadTime: this.metrics.loadTime || 0,
      renderTime: 0, // Se mide por componente
      memoryUsage: this.metrics.memoryUsage || 0,
    };
  }
}

// 🚀 WEBPACK BUNDLE ANALYZER CONFIG
export const bundleAnalyzerConfig = {
  analyzerMode: 'static',
  openAnalyzer: false,
  reportFilename: '../bundle-analysis/report.html',
  excludeAssets: [
    /\.map$/,
    /^_next\/static\/chunks\/pages\/.*\.js$/,
  ],
  generateStatsFile: true,
  statsFilename: '../bundle-analysis/stats.json',
};

// 🚀 BUNDLE SIZE RECOMMENDATIONS
export const BUNDLE_RECOMMENDATIONS = {
  CRITICAL_THRESHOLDS: {
    TOTAL_JS: 250 * 1024, // 250KB
    MAIN_CHUNK: 100 * 1024, // 100KB
    VENDOR_CHUNK: 150 * 1024, // 150KB
  },
  
  OPTIMIZATIONS: [
    'Use dynamic imports for heavy components',
    'Implement route-based code splitting',
    'Tree shake unused dependencies',
    'Use specific imports instead of full libraries',
    'Compress images with next/image optimization',
    'Enable gzip/brotli compression',
    'Use service workers for caching',
  ],
  
  HIGH_IMPACT_LIBRARIES: [
    'moment.js → date-fns (reduce 67KB)',
    'lodash → lodash-es (tree shakeable)',
    'recharts → lightweight chart library',
    'react-pdf → lazy load with dynamic import',
  ],
} as const;

export {
  OptimizedChart,
  OptimizedBarChart,
  OptimizedPDFViewer,
  OptimizedMap,
  OptimizedImageGallery,
};