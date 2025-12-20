'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { NotificacionesPage } from '@/components/notificaciones/NotificacionesPage';

export default function VeterinarioNotificacionesPage() {
  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <NotificacionesPage />
    </SimpleRoleGuard>
  );
}
