import * as Sentry from '@sentry/nextjs';

export function register() {
  // Solo inicializar Sentry en producción
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      enabled: true,
      
      // Performance monitoring
      tracesSampleRate: 1.0,
      
      // Error sampling
      sampleRate: 1.0,
      
      // Debug mode
      debug: false,
      
      integrations: [
        Sentry.prismaIntegration(),
      ],
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      enabled: true,
      
      tracesSampleRate: 1.0,
      sampleRate: 1.0,
      debug: false,
    });
  }
}

// Export required hook for error handling in React Server Components
export const onRequestError = Sentry.captureRequestError;
