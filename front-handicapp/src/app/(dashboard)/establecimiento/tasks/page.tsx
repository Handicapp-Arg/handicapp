'use client';

import { useQueryClient } from '@tanstack/react-query';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTareas, tareasKeys } from '@/lib/hooks';
import { PageShell } from '@/components/ui/page-shell';

export default function EstablecimientoTareasPage() {
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
    <SimpleRoleGuard roles={['establecimiento']}>
      <PageShell title="Tareas" description="Gestiona y hace seguimiento de las tareas del establecimiento">
        <TareaKanban tareas={tareas} onRefresh={handleRefresh} />
      </PageShell>
    </SimpleRoleGuard>
  );
}

