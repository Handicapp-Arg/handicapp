'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { errorLogger } from '@/lib/errorLogger';
import { ErrorInfo, ReactNode } from 'react';

interface RootErrorBoundaryProps {
  children: ReactNode;
  showDetails?: boolean;
}

/**
 * Root Error Boundary - Client Component wrapper
 * 
 * Envuelve el ErrorBoundary con la lógica de logging
 * para poder ser usado desde Server Components.
 */
export function RootErrorBoundary({ children, showDetails }: RootErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    errorLogger.logCriticalError(error, {
      component: 'RootLayout',
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
