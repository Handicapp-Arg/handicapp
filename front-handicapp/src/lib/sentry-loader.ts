/**
 * Sentry Lazy Loader
 * Carga Sentry de forma asíncrona solo en producción para reducir bundle inicial
 */

let sentryLoaded = false;
let sentryModule: typeof import('@sentry/nextjs') | null = null;

/**
 * Carga Sentry de forma lazy solo en producción
 */
async function loadSentry() {
  if (sentryLoaded || sentryModule) {
    return sentryModule;
  }

  // Solo cargar en producción
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  try {
    sentryModule = await import('@sentry/nextjs');
    sentryLoaded = true;
    return sentryModule;
  } catch (error) {
    console.warn('Failed to load Sentry:', error);
    return null;
  }
}

/**
 * Capturar un error manualmente (lazy)
 */
export async function captureError(error: Error | string, context?: Record<string, unknown>) {
  const Sentry = await loadSentry();
  if (!Sentry) return;

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
 * Capturar un mensaje informativo (lazy)
 */
export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  const Sentry = await loadSentry();
  if (!Sentry) return;
  
  Sentry.captureMessage(message, { level });
}

/**
 * Agregar breadcrumb (lazy)
 */
export async function addBreadcrumb(
  message: string,
  category?: string,
  level?: 'debug' | 'info' | 'warning' | 'error'
) {
  const Sentry = await loadSentry();
  if (!Sentry) return;

  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Configurar usuario actual (lazy)
 */
export async function setUser(user: { id: string; email?: string; username?: string; role?: string }) {
  const Sentry = await loadSentry();
  if (!Sentry) return;
  
  Sentry.setUser(user);
}

/**
 * Limpiar usuario actual (lazy)
 */
export async function clearUser() {
  const Sentry = await loadSentry();
  if (!Sentry) return;
  
  Sentry.setUser(null);
}

/**
 * Agregar tag (lazy)
 */
export async function setTag(key: string, value: string) {
  const Sentry = await loadSentry();
  if (!Sentry) return;
  
  Sentry.setTag(key, value);
}

/**
 * Agregar contexto adicional (lazy)
 */
export async function setContext(name: string, context: Record<string, unknown>) {
  const Sentry = await loadSentry();
  if (!Sentry) return;
  
  Sentry.setContext(name, context);
}

/**
 * Hook para integrar Sentry con autenticación (lazy)
 */
export async function identifyUser(user: {
  id: string;
  email?: string;
  nombre?: string;
  rol?: string;
}) {
  const Sentry = await loadSentry();
  if (!Sentry) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.nombre,
  });
  
  if (user.rol) {
    Sentry.setTag('user_role', user.rol);
  }
}

/**
 * Capturar error de red/API (lazy)
 */
export async function captureApiError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number
) {
  const Sentry = await loadSentry();
  if (!Sentry) return;

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
 * Capturar error de renderizado de componente (lazy)
 */
export async function captureComponentError(
  error: Error,
  componentName: string,
  props?: Record<string, unknown>
) {
  const Sentry = await loadSentry();
  if (!Sentry) return;

  Sentry.withScope((scope) => {
    scope.setTag('component_name', componentName);
    scope.setContext('component_props', props || {});
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

/**
 * Capturar evento crítico (lazy)
 */
export async function captureCritical(error: Error | string, context?: Record<string, unknown>) {
  const Sentry = await loadSentry();
  if (!Sentry) return;

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

// Pre-cargar Sentry en producción después de la carga inicial
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Cargar después de 2 segundos para no bloquear la carga inicial
  setTimeout(() => {
    loadSentry();
  }, 2000);
}
