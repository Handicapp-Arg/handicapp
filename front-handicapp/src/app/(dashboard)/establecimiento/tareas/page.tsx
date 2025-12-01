'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function EstablecimientoTareasPage() {
  const { tasks, loading } = useTasks({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando tareas..." />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <TareaKanban tareas={tasks} />
      </div>
    </SimpleRoleGuard>
  );
}
