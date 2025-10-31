/**
 * Error Logger Service
 * 
 * Servicio centralizado para logging de errores.
 * Integrado con Sentry para monitoring en producción.
 */

import * as Sentry from '@sentry/nextjs';

interface ErrorContext {
  userId?: string;
  userRole?: string;
  route?: string;
  component?: string;
  timestamp?: Date;
  userAgent?: string;
  [key: string]: unknown;
}

interface LogErrorOptions {
  error: Error;
  context?: ErrorContext;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
}

type SentrySeverity = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

class ErrorLoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private sentryEnabled = process.env.NODE_ENV === 'production'; // Auto-enabled en producción

  /**
   * Log de error principal
   */
  logError(options: LogErrorOptions): void {
    const { error, context, severity = 'medium', tags } = options;

    // Agregar información del navegador
    const enrichedContext: ErrorContext = {
      ...context,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    // Log en consola (desarrollo)
    if (this.isDevelopment) {
      console.group(`🚨 Error [${severity.toUpperCase()}]`);
      console.error('Error:', error);
      console.log('Context:', enrichedContext);
      if (tags) console.log('Tags:', tags);
      console.groupEnd();
    }

    // TODO: Enviar a Sentry cuando esté configurado
    if (this.sentryEnabled) {
      this.sendToSentry(error, enrichedContext, severity, tags);
    }

    // Guardar en localStorage para debug (solo últimos 10)
    if (typeof window !== 'undefined') {
      this.saveToLocalStorage(error, enrichedContext);
    }
  }

  /**
   * Log de error de API
   */
  logApiError(
    error: Error,
    endpoint: string,
    method: string = 'GET',
    statusCode?: number
  ): void {
    this.logError({
      error,
      context: {
        component: 'API',
        endpoint,
        method,
        statusCode,
      },
      severity: statusCode && statusCode >= 500 ? 'high' : 'medium',
      tags: {
        type: 'api_error',
        endpoint,
        method,
      },
    });
  }

  /**
   * Log de error de UI/Componente
   */
  logComponentError(
    error: Error,
    componentName: string,
    props?: Record<string, unknown>
  ): void {
    this.logError({
      error,
      context: {
        component: componentName,
        props,
      },
      severity: 'medium',
      tags: {
        type: 'component_error',
        component: componentName,
      },
    });
  }

  /**
   * Log de error crítico (crashea la app)
   */
  logCriticalError(error: Error, context?: ErrorContext): void {
    this.logError({
      error,
      context,
      severity: 'critical',
      tags: {
        type: 'critical',
      },
    });
  }

  /**
   * Guardar errores en localStorage para debug
   */
  private saveToLocalStorage(error: Error, context: ErrorContext): void {
    try {
      const storageKey = 'handicapp_error_logs';
      const existing = localStorage.getItem(storageKey);
      const logs = existing ? JSON.parse(existing) : [];

      logs.unshift({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });

      // Mantener solo últimos 10 errores
      const trimmed = logs.slice(0, 10);
      localStorage.setItem(storageKey, JSON.stringify(trimmed));
    } catch (e) {
      // Silenciar error de localStorage
      console.warn('No se pudo guardar error en localStorage', e);
    }
  }

  /**
   * Obtener logs guardados (para debug)
   */
  getLogs(): unknown[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const storageKey = 'handicapp_error_logs';
      const existing = localStorage.getItem(storageKey);
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  }

  /**
   * Limpiar logs guardados
   */
  clearLogs(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('handicapp_error_logs');
    } catch (e) {
      console.warn('No se pudo limpiar logs', e);
    }
  }

  /**
   * Enviar error a Sentry
   */
  private sendToSentry(
    error: Error,
    context: ErrorContext,
    severity: string,
    tags?: Record<string, string>
  ): void {
    try {
      // Mapear severidad a formato Sentry
      const sentryLevel = this.mapSeverityToSentry(severity);

      // Configurar scope con contexto y tags
      Sentry.withScope((scope) => {
        // Set severity level
        scope.setLevel(sentryLevel);

        // Add custom context
        scope.setContext('custom', {
          ...context,
          timestamp: context.timestamp?.toISOString(),
        });

        // Add tags
        if (tags) {
          Object.entries(tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }

        // Add user info if available
        if (context.userId) {
          scope.setUser({
            id: context.userId,
            role: context.userRole,
          });
        }

        // Add route as tag
        if (context.route) {
          scope.setTag('route', context.route);
        }

        // Add component as tag
        if (context.component) {
          scope.setTag('component', context.component);
        }

        // Capture the exception
        Sentry.captureException(error);
      });

      // Log success in development
      if (this.isDevelopment) {
        console.log('✅ Error enviado a Sentry:', {
          error: error.message,
          severity: sentryLevel,
          context,
          tags,
        });
      }
    } catch (sentryError) {
      // Si falla Sentry, al menos loguear en consola
      console.error('❌ Error al enviar a Sentry:', sentryError);
    }
  }

  /**
   * Mapear severidad interna a formato Sentry
   */
  private mapSeverityToSentry(severity: string): SentrySeverity {
    const map: Record<string, SentrySeverity> = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'fatal',
    };
    return map[severity] || 'error';
  }

  /**
   * Habilitar Sentry manualmente (útil para testing)
   */
  enableSentry(): void {
    this.sentryEnabled = true;
  }

  /**
   * Deshabilitar Sentry manualmente
   */
  disableSentry(): void {
    this.sentryEnabled = false;
  }
}

// Singleton instance
export const errorLogger = new ErrorLoggerService();

/**
 * Hook de React para usar el error logger
 */
export function useErrorLogger() {
  return {
    logError: (error: Error, context?: ErrorContext) =>
      errorLogger.logError({ error, context }),
    logApiError: errorLogger.logApiError.bind(errorLogger),
    logComponentError: errorLogger.logComponentError.bind(errorLogger),
    logCriticalError: errorLogger.logCriticalError.bind(errorLogger),
    getLogs: errorLogger.getLogs.bind(errorLogger),
    clearLogs: errorLogger.clearLogs.bind(errorLogger),
  };
}
