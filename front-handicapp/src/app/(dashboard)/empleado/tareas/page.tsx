
'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { Loader } from '@/components/ui/loader';

export default function EmpleadoTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['empleado']}>
      <TareaKanban tareas={tasks} onRefresh={loadTasks} />
    </SimpleRoleGuard>
  );
}

