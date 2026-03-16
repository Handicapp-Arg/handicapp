'use client';

import { useQueryClient } from '@tanstack/react-query';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTareas, tareasKeys } from '@/lib/hooks';
import { PageShell } from '@/components/ui/page-shell';

export default function AdminTareasPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useTareas({ page: 1, limit: 20 });
  const tareas = data?.data ?? [];

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });

  if (isLoading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />)}
    </div>
  );

  return (
    <SimpleAdminOnly>
      <PageShell title="Gestión de Tareas" description="Administra y hace seguimiento de todas las tareas del sistema">
        <TareaKanban tareas={tareas} onRefresh={handleRefresh} />
      </PageShell>
    </SimpleAdminOnly>
  );
}
