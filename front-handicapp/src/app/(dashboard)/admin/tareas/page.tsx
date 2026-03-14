'use client';

import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

export default function AdminTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) return <TableSkeleton rows={8} columns={4} />;

  return (
    <SimpleAdminOnly>
      <TareaKanban tareas={tasks} onRefresh={loadTasks} />
    </SimpleAdminOnly>
  );
}
