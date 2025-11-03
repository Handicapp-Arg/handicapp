/**
 * Offline Indicator Component
 * 
 * Muestra un banner cuando la aplicación está offline
 */

'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Estado inicial
    setIsOnline(navigator.onLine);

    // Handlers
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      
      // Ocultar mensaje de reconexión después de 3 segundos
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline ? (
        <div className="bg-orange-500 text-white px-4 py-2 text-sm font-medium text-center animate-in slide-in-from-top-2">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Sin conexión a Internet - Modo offline</span>
          </div>
        </div>
      ) : (
        <div className="bg-green-500 text-white px-4 py-2 text-sm font-medium text-center animate-in slide-in-from-top-2">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>Conexión restablecida</span>
          </div>
        </div>
      )}
    </div>
  );
}
