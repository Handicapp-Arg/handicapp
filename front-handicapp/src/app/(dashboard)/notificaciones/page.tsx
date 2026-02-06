'use client';

import { NotificacionesPage } from '@/components/notificaciones/NotificacionesPage';

/**
 * Página de notificaciones compartida por todos los roles
 * No necesita guards porque ya está protegida por el DashboardLayout
 */
export default function NotificacionesSharedPage() {
  return <NotificacionesPage />;
}
