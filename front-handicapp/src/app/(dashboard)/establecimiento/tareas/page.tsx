'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

export default function EstablecimientoTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) {
    return <TableSkeleton rows={6} columns={4} />;
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <TareaKanban tareas={tasks} onRefresh={loadTasks} />
    </SimpleRoleGuard>
  );
}

