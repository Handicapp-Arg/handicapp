'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import { ClipboardList, Sparkles } from 'lucide-react';

export default function EstablecimientoTareasPage() {
  const { tasks, loading } = useTasks({ autoLoad: true });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando tareas..." />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-6">
        {/* Header con descripción */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gestión Operativa - Tareas Diarias
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Organiza y gestiona las tareas del día a día de tu establecimiento. 
                Arrastra las tarjetas entre columnas para cambiar su estado.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 w-fit">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">
                  Las tareas completadas de caballos se registran automáticamente en su historial
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <TareaKanban tareas={tasks} />
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
