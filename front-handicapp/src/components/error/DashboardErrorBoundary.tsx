'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { errorLogger } from '@/lib/errorLogger';
import { ErrorInfo, ReactNode } from 'react';

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  showDetails?: boolean;
}

/**
 * Dashboard Error Boundary - Client Component wrapper
 * 
 * Envuelve el ErrorBoundary con la lógica de logging
 * específica para el Dashboard.
 */
export function DashboardErrorBoundary({ children, showDetails }: DashboardErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    errorLogger.logCriticalError(error, {
      component: 'DashboardLayout',
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <ErrorBoundary
      showDetails={showDetails}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
