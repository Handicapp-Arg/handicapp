'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function EstablecimientoTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando tareas..." />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <TareaKanban tareas={tasks} onRefresh={loadTasks} />
    </SimpleRoleGuard>
  );
}
