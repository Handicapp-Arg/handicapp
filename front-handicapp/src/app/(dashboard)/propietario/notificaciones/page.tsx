'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { NotificacionesPage } from '@/components/notificaciones/NotificacionesPage';

export default function PropietarioNotificacionesPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <NotificacionesPage />
    </SimpleRoleGuard>
  );
}
