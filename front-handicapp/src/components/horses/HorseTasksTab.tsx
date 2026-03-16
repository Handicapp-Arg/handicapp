'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTareas, tareasKeys } from '@/lib/hooks';
import { Info, Plus, Filter } from 'lucide-react';

interface CaballoTareasTabProps {
  caballoId: number;
  caballoNombre: string;
  onTareaCreated?: () => void;
}

export function CaballoTareasTab({ caballoId, caballoNombre, onTareaCreated }: CaballoTareasTabProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useTareas({ caballo_id: caballoId, page: 1, limit: 50 });
  const tareas = data?.data ?? [];

  const tareasActivas = tareas.filter(
    t => t.estado === 'pendiente' || t.estado === 'en_progreso'
  ).length;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
    onTareaCreated?.();
  };

  if (isLoading) return (
    <div className="space-y-3 p-4">
      {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-md animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 rounded-md">
            <Info className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Tareas de {caballoNombre}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Solicitudes de atención específicas para este caballo.
            </p>
            {tareasActivas > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <Filter className="h-3 w-3" />
                  {tareasActivas} {tareasActivas === 1 ? 'tarea activa' : 'tareas activas'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {tareas.length > 0 ? (
        <TareaKanban
          tareas={tareas}
          onRefresh={handleRefresh}
          compactMode={true}
          caballoId={caballoId}
          showCaballoInfo={false}
        />
      ) : (
        <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-md">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Sin tareas para {caballoNombre}</h3>
          <p className="text-sm text-gray-500">Creá una nueva tarea desde el kanban.</p>
        </div>
      )}
    </div>
  );
}

export default CaballoTareasTab;
