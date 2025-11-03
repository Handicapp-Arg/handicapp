/**
 * Sentry Utilities
 * 
 * Helpers para trabajar con Sentry de forma directa
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Capturar un error manualmente
 */
export function captureError(error: Error | string, context?: Record<string, unknown>) {
  if (typeof error === 'string') {
    Sentry.captureMessage(error, {
      level: 'error',
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  }
}

/**
 * Capturar un mensaje informativo
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, { level });
}

/**
 * Agregar breadcrumb (rastro de navegación)
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: 'debug' | 'info' | 'warning' | 'error'
) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Configurar usuario actual
 */
export function setUser(user: { id: string; email?: string; username?: string; role?: string }) {
  Sentry.setUser(user);
}

/**
 * Limpiar usuario actual
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Agregar tag
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Agregar contexto adicional
 */
export function setContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context);
}

/**
 * Iniciar un span de performance
 */
export function startSpan<T>(options: { name: string; op: string }, callback: () => T): T {
  return Sentry.startSpan(options, callback);
}

/**
 * Hook para integrar Sentry con autenticación
 * Llamar cuando el usuario inicia sesión
 */
export function identifyUser(user: {
  id: string;
  email?: string;
  nombre?: string;
  rol?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.nombre,
  });
  
  // Tags adicionales
  if (user.rol) {
    Sentry.setTag('user_role', user.rol);
  }
}

/**
 * Hook para cuando el usuario cierra sesión
 */
export function clearUserSession() {
  Sentry.setUser(null);
}

/**
 * Capturar error de red/API
 */
export function captureApiError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number
) {
  Sentry.withScope((scope) => {
    scope.setTag('api_endpoint', endpoint);
    scope.setTag('api_method', method);
    if (statusCode) {
      scope.setTag('status_code', statusCode.toString());
    }
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

/**
 * Capturar error de renderizado de componente
 */
export function captureComponentError(
  error: Error,
  componentName: string,
  props?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setTag('component_name', componentName);
    scope.setContext('component_props', props || {});
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

/**
 * Capturar evento crítico (que requiere atención inmediata)
 */
export function captureCritical(error: Error | string, context?: Record<string, unknown>) {
  if (typeof error === 'string') {
    Sentry.captureMessage(error, {
      level: 'fatal',
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    Sentry.captureException(error, {
      level: 'fatal',
      contexts: context ? { custom: context } : undefined,
    });
  }
}

// Re-export Sentry for advanced usage
export { Sentry };
