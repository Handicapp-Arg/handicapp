'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { NotificacionesPage } from '@/components/notificaciones/NotificacionesPage';

export default function EstablecimientoNotificacionesPage() {
  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <NotificacionesPage />
    </SimpleRoleGuard>
  );
}
