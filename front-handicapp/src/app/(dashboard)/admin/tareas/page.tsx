'use client';

import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { Loader } from '@/components/ui/loader';

export default function AdminTareasPage() {
  const { tasks, loading } = useTasks({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <SimpleAdminOnly>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <TareaKanban tareas={tasks} />
      </div>
    </SimpleAdminOnly>
  );
}

