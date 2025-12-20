'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { NotificacionesPage } from '@/components/notificaciones/NotificacionesPage';

export default function AdminNotificacionesPage() {
  return (
    <SimpleRoleGuard roles={['admin']}>
      <NotificacionesPage />
    </SimpleRoleGuard>
  );
}
