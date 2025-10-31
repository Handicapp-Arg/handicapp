'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';
import { errorLogger } from '@/lib/errorLogger';
import { ReactNode } from 'react';

interface SafeComponentProps {
  children: ReactNode;
  componentName?: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
  compact?: boolean;
}

/**
 * Wrapper para componentes que pueden fallar
 * Muestra un error elegante sin crashear toda la página
 * 
 * @example
 * ```tsx
 * <SafeComponent componentName="ProductList">
 *   <ProductList />
 * </SafeComponent>
 * ```
 */
export function SafeComponent({
  children,
  componentName = 'Component',
  fallbackTitle,
  fallbackMessage,
  compact = false,
}: SafeComponentProps) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          title={fallbackTitle}
          message={fallbackMessage}
          compact={compact}
        />
      }
      onError={(error, errorInfo) => {
        errorLogger.logComponentError(error, componentName, {
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Wrapper para formularios críticos
 */
export function SafeForm({
  children,
  formName,
}: {
  children: ReactNode;
  formName: string;
}) {
  return (
    <SafeComponent
      componentName={`Form:${formName}`}
      fallbackTitle="Error en el formulario"
      fallbackMessage="No se pudo cargar el formulario correctamente. Por favor, intenta recargar la página."
    >
      {children}
    </SafeComponent>
  );
}

/**
 * Wrapper para tablas de datos
 */
export function SafeTable({
  children,
  tableName,
}: {
  children: ReactNode;
  tableName: string;
}) {
  return (
    <SafeComponent
      componentName={`Table:${tableName}`}
      fallbackTitle="Error al cargar la tabla"
      fallbackMessage="No se pudieron cargar los datos. Intenta refrescar la página."
      compact
    >
      {children}
    </SafeComponent>
  );
}

/**
 * Wrapper para gráficos y estadísticas
 */
export function SafeChart({
  children,
  chartName,
}: {
  children: ReactNode;
  chartName: string;
}) {
  return (
    <SafeComponent
      componentName={`Chart:${chartName}`}
      fallbackTitle="Error al cargar gráfico"
      fallbackMessage="No se pudo renderizar la visualización."
      compact
    >
      {children}
    </SafeComponent>
  );
}
