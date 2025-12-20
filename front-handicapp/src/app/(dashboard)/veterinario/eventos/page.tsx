'use client';

import React, { useMemo, useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CalendarioEventos } from '@/components/dashboard/CalendarioEventos';
import { EventoForm } from '@/components/dashboard/EventoForm';
import { useEventos } from '@/lib/hooks';
import { Sparkles } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import type { Evento } from '@/lib/services/eventoService';

interface EventoWithTarea extends Evento {
  originado_de_tarea_id?: number;
}

export default function VeterinarioEventosPage() {
  const { data: eventos = [], isLoading: loading, refetch } = useEventos({ page: 1, limit: 500 });
  const [showForm, setShowForm] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<EventoWithTarea | null>(null);

  const eventosArray = useMemo(() => {
    return Array.isArray(eventos) ? eventos : (eventos as { data?: EventoWithTarea[] })?.data || [];
  }, [eventos]);

  const eventosStats = useMemo(() => {
    const now = new Date();
    
    const total = eventosArray.length;
    const proximos = eventosArray.filter((e: EventoWithTarea) => new Date(e.fecha_evento) > now && e.estado !== 'cancelado').length;
    const completados = eventosArray.filter((e: EventoWithTarea) => e.estado === 'completado').length;
    const cancelados = eventosArray.filter((e: EventoWithTarea) => e.estado === 'cancelado').length;
    const autoGenerados = eventosArray.filter((e: EventoWithTarea) => e.originado_de_tarea_id).length;

    return { total, proximos, completados, cancelados, autoGenerados };
  }, [eventosArray]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." variant="warning" />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          
          {/* Header Moderno */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Eventos Veterinarios
                    </h1>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Gestiona consultas, tratamientos y procedimientos médicos
                    </p>
                  </div>
                </div>
                
                {/* Info badge - Eventos auto-generados */}
                {eventosStats.autoGenerados > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm text-purple-700 mt-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <span className="font-semibold">{eventosStats.autoGenerados}</span> consultas completadas automáticamente
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calendario de Eventos */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
            <CalendarioEventos 
              eventos={eventosArray}
              onCreateEvento={() => {
                setSelectedEvento(null);
                setShowForm(true);
              }}
              onEventoClick={(evento) => {
                setSelectedEvento(evento as EventoWithTarea);
                setShowForm(true);
              }}
            />
          </div>

          {/* Modal de formulario */}
          <EventoForm
            isOpen={showForm}
            onClose={() => {
              setShowForm(false);
              setSelectedEvento(null);
            }}
            evento={selectedEvento}
            onSuccess={() => {
              setShowForm(false);
              setSelectedEvento(null);
              refetch();
            }}
          />
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
