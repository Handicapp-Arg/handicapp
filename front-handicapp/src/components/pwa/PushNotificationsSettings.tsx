/**
 * Push Notifications Settings Component
 * 
 * Permite al usuario habilitar/deshabilitar notificaciones push
 */

'use client';

import { useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';

export function PushNotificationsSettings() {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showTestNotification,
  } = usePushNotifications();

  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } else {
      const success = await subscribe();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

  const handleTest = async () => {
    const success = await showTestNotification();
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-1">
              Notificaciones no disponibles
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Tu navegador no soporta notificaciones push o no estás usando HTTPS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle de notificaciones */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-green-600 dark:text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-slate-400" />
          )}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">
              Notificaciones Push
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isSubscribed
                ? 'Recibirás notificaciones de eventos importantes'
                : 'Recibe notificaciones de eventos importantes'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isSubscribed
              ? 'bg-green-600'
              : 'bg-slate-200 dark:bg-slate-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSubscribed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Botón de prueba */}
      {isSubscribed && (
        <button
          onClick={handleTest}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar notificación de prueba
        </button>
      )}

      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
          <Check className="w-4 h-4" />
          <span>
            {isSubscribed
              ? 'Notificaciones habilitadas'
              : 'Notificaciones deshabilitadas'}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Estado del permiso */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Estado: {permission === 'granted' ? '✅ Permitido' : permission === 'denied' ? '❌ Bloqueado' : '⚠️ Pendiente'}
      </div>
    </div>
  );
}
