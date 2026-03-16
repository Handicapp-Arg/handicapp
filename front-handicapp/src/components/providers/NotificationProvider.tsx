/**
 * NotificationProvider
 * Provider global para gestionar notificaciones en tiempo real
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Notificacion } from '@/lib/services/notificationService';

interface NotificationContextType {
  // Estado
  notificaciones: Notificacion[];
  contador: number;
  stats: {
    total: number;
    no_leidas: number;
    leidas: number;
    importantes: number;
  };
  loading: boolean;
  error: string | null;
  isConnected: boolean;

  // Acciones
  cargarNotificaciones: () => Promise<void>;
  marcarComoLeida: (id: number) => Promise<void>;
  marcarTodasComoLeidas: () => Promise<void>;
  eliminarNotificacion: (id: number) => Promise<void>;
  eliminarLeidas: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const notificationData = useNotifications();

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook para usar el contexto de notificaciones
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext debe usarse dentro de NotificationProvider');
  }
  
  return context;
}
