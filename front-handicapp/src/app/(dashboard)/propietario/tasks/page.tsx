'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaList } from '@/components/dashboard/TareaList';
import { PageShell } from '@/components/ui/page-shell';

export default function PropietarioTareasPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <PageShell title="Mis Tareas" description="Seguimiento de tareas y actividades de tus caballos">
        <TareaList />
      </PageShell>
    </SimpleRoleGuard>
  );
}
