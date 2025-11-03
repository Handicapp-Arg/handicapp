'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  compact?: boolean;
}

/**
 * Componente de fallback simple para errores
 * Útil para errores en componentes específicos (no toda la página)
 */
export function ErrorFallback({
  error,
  resetError,
  title = 'Error al cargar',
  message = 'Hubo un problema al cargar este contenido',
  compact = false,
}: ErrorFallbackProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900">{title}</p>
          {error && (
            <p className="text-xs text-red-700 mt-1 truncate">{error.message}</p>
          )}
        </div>
        {resetError && (
          <button
            onClick={resetError}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Reintentar"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="p-4 bg-red-100 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-lg w-full">
          <p className="text-sm text-red-700 font-mono break-words">
            {error.message}
          </p>
        </div>
      )}
      
      {resetError && (
        <button
          onClick={resetError}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Intentar nuevamente
        </button>
      )}
    </div>
  );
}

/**
 * Fallback minimalista para loading states con error
 */
export function LoadingErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600 mb-3">Error al cargar los datos</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
