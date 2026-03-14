'use client';

/**
 * 📋 MIS TAREAS - VETERINARIO
 * Kanban de gestión de tareas médicas y actividades diarias
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

export default function VeterinarioTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) {
    return <TableSkeleton rows={6} columns={4} />;
  }

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <TareaKanban tareas={tasks} onRefresh={loadTasks} />
    </SimpleRoleGuard>
  );
}


