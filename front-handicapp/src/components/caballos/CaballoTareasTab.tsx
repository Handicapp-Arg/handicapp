'use client';

import React, { useState, useEffect } from 'react';
import { TareaKanban } from '@/components/dashboard/TareaKanban';
import { useTasks } from '@/lib/hooks/useTasks';
import { Info, Plus, Filter } from 'lucide-react';
import type { Tarea } from '@/lib/services/tareaService';

interface CaballoTareasTabProps {
  /** ID del caballo para filtrar tareas */
  caballoId: number;
  /** Nombre del caballo para mostrar en mensajes */
  caballoNombre: string;
  /** Callback cuando se crea una nueva tarea */
  onTareaCreated?: () => void;
}

/**
 * CaballoTareasTab - Tab de tareas activas del caballo
 * 
 * @description
 * Muestra las tareas/solicitudes específicas de un caballo en modo compacto.
 * Se integra en la página de detalle del caballo para centralizar toda
 * la información en un solo lugar.
 * 
 * @features
 * - Filtrado automático por caballo
 * - Vista kanban compacta
 * - Creación rápida de tareas con caballo preseleccionado
 * - Indicador de tareas activas
 * 
 * @author Senior Dev Team
 * @version 1.0.0
 */
export function CaballoTareasTab({ 
  caballoId, 
  caballoNombre,
  onTareaCreated 
}: CaballoTareasTabProps) {
  const { tasks: allTasks, loading, loadTasks } = useTasks({ autoLoad: true });
  const [filteredTasks, setFilteredTasks] = useState<Tarea[]>([]);

  // Filtrar tareas por caballo
  useEffect(() => {
    if (allTasks && allTasks.length > 0) {
      const tareasDelCaballo = allTasks.filter(
        tarea => tarea.caballo_id === caballoId
      );
      setFilteredTasks(tareasDelCaballo);
    } else {
      setFilteredTasks([]);
    }
  }, [allTasks, caballoId]);

  // Contar tareas activas (pendiente + en progreso)
  const tareasActivas = filteredTasks.filter(
    tarea => tarea.estado === 'pendiente' || tarea.estado === 'en_progreso'
  ).length;

  const handleRefresh = async () => {
    await loadTasks();
    if (onTareaCreated) {
      onTareaCreated();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información contextual */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Tareas de {caballoNombre}
              </h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Aquí puedes ver y crear solicitudes de atención específicas para este caballo. 
                El equipo del establecimiento se encargará de ejecutarlas.
              </p>
              {tareasActivas > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Filter className="h-3 w-3 mr-1" />
                    {tareasActivas} {tareasActivas === 1 ? 'tarea activa' : 'tareas activas'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban de Tareas en modo compacto */}
      {filteredTasks.length > 0 ? (
        <TareaKanban 
          tareas={filteredTasks}
          onRefresh={handleRefresh}
          compactMode={true}
          caballoId={caballoId}
          showCaballoInfo={false}
        />
      ) : (
        // Estado vacío - No hay tareas
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay tareas para {caballoNombre}
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Aún no se han creado solicitudes de atención para este caballo. 
            Puedes crear una nueva tarea usando el botón en la parte superior del kanban.
          </p>
        </div>
      )}
    </div>
  );
}

export default CaballoTareasTab;

