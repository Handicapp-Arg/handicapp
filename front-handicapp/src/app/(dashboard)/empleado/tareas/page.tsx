
'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

export default function EmpleadoTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) {
    return <TableSkeleton rows={8} columns={4} />;
  }

  return (
    <SimpleRoleGuard roles={['empleado']}>
      <TareaKanban tareas={tasks} onRefresh={loadTasks} />
    </SimpleRoleGuard>
  );
}

