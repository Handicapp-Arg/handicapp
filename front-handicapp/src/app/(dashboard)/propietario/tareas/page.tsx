
'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

/**
 * Página de Tareas para Propietario
 * 
 * FILOSOFÍA:
 * - El propietario ve tareas como "solicitudes" de atención para sus caballos
 * - NO puede completar tareas operativas (eso lo hace el establecimiento/personal)
 * - Solo puede crear solicitudes y ver el estado de avance
 * 
 * PERMISOS:
 * - ✅ Ver tareas de sus caballos
 * - ✅ Crear solicitudes (tareas)
 * - ❌ Completar/cambiar estado (solo el asignado puede)
 * - ❌ Eliminar tareas
 */
export default function PropietarioTareasPage() {
  const { tasks, loading, loadTasks } = useTasks({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando solicitudes..." />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-6">
        {/* Header informativo */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Aquí puedes solicitar atención o servicios para tus caballos. El equipo del establecimiento se encargará de ejecutarlas y actualizar sobre su progreso.
              </p>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <TareaKanban tareas={tasks} onRefresh={loadTasks} />
      </div>
    </SimpleRoleGuard>
  );
}
