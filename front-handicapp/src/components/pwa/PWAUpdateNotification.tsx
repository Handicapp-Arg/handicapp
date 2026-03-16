/**
 * PWA Update Notification Component
 * 
 * Detecta cuando hay una nueva versión del service worker disponible
 * y notifica al usuario para que recargue la página.
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Detectar nueva versión del service worker
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay un nuevo service worker esperando
              setWaitingWorker(newWorker);
              setShowUpdate(true);
            }
          });
        }
      });
    });

    // Listener para cuando el service worker toma el control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;

    // Enviar mensaje al service worker para que haga skipWaiting
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-5">
      <div className="bg-gray-900 text-white rounded-md p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-md flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">
              Nueva versión disponible
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              Hay una actualización de App lista para instalar
            </p>
            
            <button
              onClick={handleUpdate}
              className="w-full px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 border border-gray-200"
            >
              Actualizar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
