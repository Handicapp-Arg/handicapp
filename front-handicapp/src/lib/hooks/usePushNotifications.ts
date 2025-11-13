/**
 * usePushNotifications Hook
 * 
 * Gestiona las notificaciones push en la PWA
 * - Solicita permisos
 * - Registra el service worker
 * - Subscribe/unsubscribe a notificaciones push
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    subscription: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar soporte y estado inicial
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSupport = async () => {
      const isSupported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      if (!isSupported) {
        setState((prev) => ({ ...prev, isSupported: false }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
      }));

      // Verificar si ya está suscrito
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState((prev) => ({
          ...prev,
          isSubscribed: subscription !== null,
          subscription,
        }));
      } catch (err) {
        console.error('Error checking push subscription:', err);
      }
    };

    checkSupport();
  }, []);

  // Solicitar permiso y suscribirse
  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      setError('Las notificaciones push no son soportadas en este navegador');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Solicitar permiso
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setError('Permiso de notificaciones denegado');
        setState((prev) => ({ ...prev, permission }));
        setIsLoading(false);
        return false;
      }

      // Obtener registration del service worker
      const registration = await navigator.serviceWorker.ready;

      // Obtener VAPID public key del backend
      const vapidResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/push/vapid-public-key`, {
        credentials: 'include',
      });
      
      if (!vapidResponse.ok) {
        throw new Error('Error obteniendo VAPID public key');
      }

      const { data } = await vapidResponse.json();
      const vapidPublicKey = data.publicKey;

      // Convertir VAPID key a Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Suscribirse a push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      });

      // Enviar subscription al backend para almacenarla
      await sendSubscriptionToBackend(subscription);

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        permission,
        subscription,
      }));

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      setError('Error al suscribirse a notificaciones push');
      setIsLoading(false);
      return false;
    }
  }, [state.isSupported]);

  // Desuscribirse
  const unsubscribe = useCallback(async () => {
    if (!state.subscription) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await state.subscription.unsubscribe();

      // Notificar al backend para eliminar la suscripción
      await removeSubscriptionFromBackend(state.subscription);

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
      }));

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError('Error al desuscribirse de notificaciones push');
      setIsLoading(false);
      return false;
    }
  }, [state.subscription]);

  // Mostrar una notificación de prueba
  const showTestNotification = useCallback(async () => {
    if (state.permission !== 'granted') {
      setError('Debes permitir las notificaciones primero');
      return false;
    }

    try {
      // Enviar solicitud al backend para que envíe la notificación push
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/push/test`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error enviando notificación de prueba');
      }

      return true;
    } catch (err) {
      console.error('Error showing test notification:', err);
      setError('Error al mostrar notificación de prueba');
      return false;
    }
  }, [state.permission]);

  return {
    ...state,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showTestNotification,
  };
}

// Utilidad para convertir VAPID key de base64 a Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Enviar subscription al backend
async function sendSubscriptionToBackend(subscription: PushSubscription) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent,
    }),
  });

  if (!response.ok) {
    throw new Error('Error enviando subscription al backend');
  }
}

async function removeSubscriptionFromBackend(subscription: PushSubscription) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/push/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      endpoint: subscription.endpoint,
    }),
  });

  if (!response.ok) {
    throw new Error('Error eliminando subscription del backend');
  }
}
//   await fetch('/api/push/unsubscribe', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(subscription),
//   });
// }
