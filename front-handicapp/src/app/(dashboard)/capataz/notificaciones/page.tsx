'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { NotificacionesPage } from '@/components/notificaciones/NotificacionesPage';

export default function CapatazNotificacionesPage() {
  return (
    <SimpleRoleGuard roles={['capataz']}>
      <NotificacionesPage />
    </SimpleRoleGuard>
  );
}
