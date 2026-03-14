'use client';

import React, { useMemo, useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CalendarioEventos } from '@/components/dashboard/CalendarioEventos';
import { EventoForm } from '@/components/dashboard/EventoForm';
import { useEventos } from '@/lib/hooks';
import CardGridSkeleton from '@/components/skeletons/CardGridSkeleton';
import type { Evento } from '@/lib/services/eventoService';

export default function EmpleadoEventosPage() {
  const { data: eventos = [], isLoading: loading, refetch } = useEventos({ page: 1, limit: 500 });
  const [showForm, setShowForm] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  const eventosArray = useMemo(() => {
    return Array.isArray(eventos) ? eventos : (eventos as { data?: Evento[] })?.data || [];
  }, [eventos]);

  if (loading) return <CardGridSkeleton cards={6} columns={3} />;

  return (
    <SimpleRoleGuard roles={['empleado']}>
      <div className="space-y-6">

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                Calendario de Eventos
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Actividades y eventos programados
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
          <CalendarioEventos
            eventos={eventosArray}
            onCreateEvento={() => {
              setSelectedEvento(null);
              setShowForm(true);
            }}
            onEventoClick={(evento) => {
              setSelectedEvento(evento as Evento);
              setShowForm(true);
            }}
          />
        </div>

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
    </SimpleRoleGuard>
  );
}
