'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// Solo inicializar Sentry en producción
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: true,
  
    // Performance monitoring
    tracesSampleRate: 1.0,
  
    // Replay sessions for debugging
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  
    // Filter sensitive data
    beforeSend(event) {
      // Don't send passwords or tokens
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
  });
}

// Export required hooks for Next.js integration
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

export default function SentryInit() {
  useEffect(() => {
    // You can add custom error handlers here
  }, []);
  
  return null;
}
