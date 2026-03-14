'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { NotificacionesPage } from '@/components/notificaciones/NotificacionesPage';

export default function EmpleadoNotificacionesPage() {
  return (
    <SimpleRoleGuard roles={['empleado']}>
      <NotificacionesPage />
    </SimpleRoleGuard>
  );
}
