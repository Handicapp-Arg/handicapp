'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { errorLogger } from '@/lib/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
}

/**
 * Error Boundary Component
 * 
 * Captura errores en componentes hijos y muestra un fallback UI
 * en lugar de crashear toda la aplicación.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Actualizar el state para mostrar el fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Actualizar state con info del error
    this.setState({
      error,
      errorInfo,
    });

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar a Sentry vía errorLogger
    errorLogger.logComponentError(error, 'ErrorBoundary', { componentStack: errorInfo.componentStack });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleStack = () => {
    this.setState(prev => ({ showStack: !prev.showStack }));
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback custom, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback UI por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ¡Oops! Algo salió mal
                </h1>
                <p className="text-gray-600 mt-1">
                  No te preocupes, ya estamos trabajando en ello
                </p>
              </div>
            </div>

            {/* Error Message */}
            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900 mb-1">
                  Error detectado:
                </p>
                <p className="text-sm text-red-700 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Intentar nuevamente
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Recargar página
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
            </div>

            {/* Stack Trace (solo en desarrollo) */}
            {this.props.showDetails && this.state.errorInfo && (
              <div className="border-t pt-6">
                <button
                  onClick={this.toggleStack}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3 font-medium"
                >
                  {this.state.showStack ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Detalles técnicos (para desarrolladores)
                </button>

                {this.state.showStack && (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {this.state.error?.stack}
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Si el problema persiste, intenta cerrar sesión y volver a entrar, 
                o contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Si no hay error, renderizar los children normalmente
    return this.props.children;
  }
}

/**
 * HOC para envolver componentes con Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
