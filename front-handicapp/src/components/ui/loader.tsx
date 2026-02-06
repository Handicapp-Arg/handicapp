/**
 * Sistema de Loading Unificado - HandicApp
 * 
 * Un solo componente para todos los estados de carga
 * Arquitectura: Composition over Configuration
 * 
 * @example
 * // Página completa
 * <Loader />
 * 
 * @example  
 * // En un card/sección
 * <Loader variant="section" />
 * 
 * @example
 * // En un botón
 * <Loader variant="inline" />
 * 
 * @version 2.0.0 - Simplificado sin textos
 */

import React from 'react';
import { cn } from '@/lib/utils';

type LoaderVariant = 
  | 'page'      // Pantalla completa
  | 'section'   // Dentro de cards, modales, tabs
  | 'inline'    // Botones, badges, elementos pequeños
  | 'overlay';  // Encima de contenido existente

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  /** Tipo de loader según contexto */
  variant?: LoaderVariant;
  /** Tamaño del spinner */
  size?: LoaderSize;
  /** Clase adicional */
  className?: string;
}

const sizeMap: Record<LoaderSize, string> = {
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-3',
  lg: 'w-16 h-16 border-4',
};

/**
 * Componente Loader unificado
 */
export function Loader({ 
  variant = 'page', 
  size = 'md',
  className 
}: LoaderProps) {
  
  // Spinner base con gradiente moderno y animación suave
  const spinner = (
    <div 
      className={cn(
        'rounded-full relative',
        sizeMap[size]
      )}
      aria-label="Cargando"
    >
      {/* Anillo principal con colores de la app + punto dorado */}
      <div 
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background: 'conic-gradient(from 0deg, hsl(215, 31%, 18%) 0deg, hsl(194, 54%, 21%) 120deg, hsl(197, 29%, 38%) 240deg, hsl(215, 31%, 18%) 360deg)',
          animationDuration: '1.2s',
          animationTimingFunction: 'linear',
        }}
      >
        {/* Detalle dorado que gira con el anillo */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{
            background: 'hsl(36, 28%, 56%)',
            boxShadow: '0 0 10px hsl(36, 28%, 56%), 0 0 20px hsl(36, 28%, 56%, 0.5)',
          }}
        />
      </div>
      {/* Centro blanco */}
      <div className="absolute inset-[15%] rounded-full bg-white" />
    </div>
  );

  // Variantes de contenedor
  switch (variant) {
    case 'page':
      return (
        <div className={cn(
          'fixed flex items-center justify-center',
          // Ajuste por navbar vertical (sidebar colapsado/expandido) y horizontal
          'top-16 sm:top-18 lg:top-20',  // Altura del navbar horizontal
          'left-0 lg:left-20',  // Mínimo del sidebar colapsado
          'right-0',
          'bottom-0',
          className
        )}>
          <div 
            className="rounded-full relative w-20 h-20"
            aria-label="Cargando"
          >
            {/* Anillo con colores HandicApp + punto dorado */}
            <div 
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, hsl(215, 31%, 18%) 0deg, hsl(194, 54%, 21%) 120deg, hsl(197, 29%, 38%) 240deg, hsl(215, 31%, 18%) 360deg)',
                animationDuration: '1.2s',
                animationTimingFunction: 'linear',
              }}
            >
              {/* Detalle dorado que gira */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'hsl(36, 28%, 56%)',
                  boxShadow: '0 0 10px hsl(36, 28%, 56%), 0 0 20px hsl(36, 28%, 56%, 0.5)',
                }}
              />
            </div>
            {/* Centro blanco */}
            <div className="absolute inset-[15%] rounded-full bg-white" />
          </div>
        </div>
      );

    case 'section':
      return (
        <div className={cn(
          'flex items-center justify-center py-12',
          className
        )}>
          {spinner}
        </div>
      );

    case 'inline':
      return (
        <div className={cn('inline-flex items-center justify-center', className)}>
          <div className="w-4 h-4 border-2 rounded-full animate-spin border-current border-t-transparent" />
        </div>
      );

    case 'overlay':
      return (
        <div className={cn(
          'absolute inset-0 z-50 flex items-center justify-center',
          'bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/70',
          'backdrop-blur-md backdrop-saturate-150',
          'transition-opacity duration-300',
          className
        )}>
          {spinner}
        </div>
      );

    default:
      return spinner;
  }
}

/**
 * Skeleton para contenido que se está cargando
 * Usa cuando quieres mostrar la estructura antes de que cargue el contenido
 */
export function Skeleton({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
      }}
      {...props}
    />
  );
}

/**
 * Skeletons pre-configurados para casos comunes
 */
export const SkeletonPresets = {
  Card: () => (
    <div className="bg-white rounded-lg p-6 shadow-sm space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  ),
  
  Table: ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  ),

  Chart: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg p-6 space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${Math.random() * 40 + 40}%` }} />
        ))}
      </div>
    </div>
  ),
};
