/**
 * LoadingSpinner - Sistema unificado de loading para toda la aplicación
 * @description Componente simple y funcional
 * @author HandicApp Team
 * @version 3.0.0
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Variante de color según el rol/contexto */
  variant?: 'primary' | 'secondary' | 'white' | 'brand' | 'success' | 'warning' | 'danger';
  /** Texto descriptivo opcional */
  label?: string;
  /** Subtítulo o descripción adicional */
  description?: string;
  /** Mostrar con fondo de blur decorativo */
  withBlur?: boolean;
  /** Clase adicional para el contenedor */
  className?: string;
  /** Centrar verticalmente en la pantalla */
  fullScreen?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4 border-2',
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

const colorClasses = {
  primary: 'border-blue-600 border-t-transparent',
  secondary: 'border-slate-400 border-t-transparent',
  white: 'border-white border-t-transparent',
  brand: 'border-[#af936f] border-t-transparent',
  success: 'border-emerald-600 border-t-transparent',
  warning: 'border-amber-600 border-t-transparent',
  danger: 'border-red-600 border-t-transparent',
};

const labelColorClasses = {
  primary: 'text-blue-700',
  secondary: 'text-slate-600',
  white: 'text-white',
  brand: 'text-[#af936f]',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  label,
  description,
  withBlur = false,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      fullScreen && 'min-h-screen',
      className
    )}>
      {withBlur ? (
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className={cn(
            'relative rounded-full animate-spin',
            sizeClasses[size],
            colorClasses[variant]
          )}></div>
        </div>
      ) : (
        <div className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          colorClasses[variant]
        )}></div>
      )}

      {label && (
        <div className="text-center space-y-1">
          <p className={cn(
            'text-sm font-medium',
            labelColorClasses[variant]
          )}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LoadingSpinnerFullPage - Loading para toda la página
 * @description Usado en páginas de detalle, formularios, etc.
 */
export function LoadingSpinnerFullPage({ 
  label = 'Cargando...', 
  description,
  variant = 'primary'
}: { 
  label?: string; 
  description?: string;
  variant?: LoadingSpinnerProps['variant'];
}) {
  return (
    <LoadingSpinner 
      size="lg" 
      variant={variant}
      label={label} 
      description={description}
      withBlur 
      fullScreen
    />
  );
}

/**
 * LoadingSpinnerInline - Spinner compacto para usar inline (botones, badges, etc)
 * @description Para botones, links, y elementos inline
 */
export function LoadingSpinnerInline({ 
  className,
  variant = 'primary' 
}: { 
  className?: string;
  variant?: LoadingSpinnerProps['variant'];
}) {
  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <div className={cn(
        'rounded-full animate-spin',
        sizeClasses.xs,
        colorClasses[variant]
      )}></div>
    </div>
  );
}

/**
 * LoadingSpinnerCard - Loading para cards, modales y contenedores
 * @description Para contenido dentro de cards, tabs, modales
 */
export function LoadingSpinnerCard({ 
  label,
  variant = 'primary' 
}: { 
  label?: string;
  variant?: LoadingSpinnerProps['variant'];
}) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" variant={variant} label={label} />
    </div>
  );
}

/**
 * LoadingSpinnerOverlay - Overlay con spinner para loading sobre contenido
 * @description Para mostrar loading encima de contenido existente
 */
export function LoadingSpinnerOverlay({ 
  label,
  transparent = false 
}: { 
  label?: string;
  transparent?: boolean;
}) {
  return (
    <div className={cn(
      'absolute inset-0 z-50 flex items-center justify-center',
      transparent ? 'bg-white/70 backdrop-blur-sm' : 'bg-white'
    )}>
      <LoadingSpinner 
        size="lg" 
        variant="primary" 
        label={label} 
        withBlur={!transparent}
      />
    </div>
  );
}

/**
 * LoadingSpinnerMinimal - Versión minimalista sin efectos
 * @description Para loading states simples y discretos
 */
export function LoadingSpinnerMinimal({ 
  size = 'md',
  className 
}: { 
  size?: LoadingSpinnerProps['size'];
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'rounded-full animate-spin',
        sizeClasses[size || 'md'],
        colorClasses.primary
      )}></div>
    </div>
  );
}
