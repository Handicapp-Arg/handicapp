/**
 * Lazy-loaded components para mejor performance
 * Estos componentes se cargan solo cuando son necesarios
 */

import dynamic from 'next/dynamic';
import { ChartLoadingSkeleton } from './LoadingSkeletons';

// Componentes de Charts (Chart.js es pesado) - Lazy loading
export const LazyLine = dynamic(
  () => import('react-chartjs-2').then((mod) => ({ default: mod.Line })),
  {
    ssr: false,
    loading: () => <ChartLoadingSkeleton />,
  }
);

export const LazyBar = dynamic(
  () => import('react-chartjs-2').then((mod) => ({ default: mod.Bar })),
  {
    ssr: false,
    loading: () => <ChartLoadingSkeleton />,
  }
);

export const LazyPie = dynamic(
  () => import('react-chartjs-2').then((mod) => ({ default: mod.Pie })),
  {
    ssr: false,
    loading: () => <ChartLoadingSkeleton />,
  }
);

export const LazyDoughnut = dynamic(
  () => import('react-chartjs-2').then((mod) => ({ default: mod.Doughnut })),
  {
    ssr: false,
    loading: () => <ChartLoadingSkeleton />,
  }
);

// Componente de QR Code (solo se usa en inventario)
export const LazyQRCode = dynamic(
  () => import('qrcode.react').then((mod) => ({ default: mod.QRCodeCanvas })),
  {
    ssr: false,
    loading: () => <div className="w-48 h-48 bg-slate-100 animate-pulse rounded" />,
  }
);

// Framer Motion (animaciones pesadas)
export const LazyMotionDiv = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.motion.div })),
  {
    ssr: false,
  }
);

