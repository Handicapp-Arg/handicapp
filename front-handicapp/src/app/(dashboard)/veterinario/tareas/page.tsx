'use client';

/**
 * 📋 MIS TAREAS - VETERINARIO
 * Kanban de gestión de tareas médicas y actividades diarias
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import { ClipboardList } from 'lucide-react';

export default function VeterinarioTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando tareas..." />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Mis Tareas"
          description="Gestiona tus actividades médicas y tareas diarias con el tablero Kanban"
          icon={ClipboardList}
          breadcrumbs={[
            { label: 'Dashboard', href: '/veterinario' },
            { label: 'Mis Tareas', href: '/veterinario/tareas' },
          ]}
        />

        {/* Kanban Board */}
        <TareaKanban tareas={tasks} onRefresh={loadTasks} />
      </div>
    </SimpleRoleGuard>
  );
}

