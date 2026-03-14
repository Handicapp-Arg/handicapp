'use client';

import React, { useMemo, useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { PageHeader } from '@/components/ui/page-header';
import { CalendarioEventos } from '@/components/dashboard/CalendarioEventos';
import { EventoForm } from '@/components/dashboard/EventoForm';
import { useEventos } from '@/lib/hooks';
import { Sparkles } from 'lucide-react';
import CardGridSkeleton from '@/components/skeletons/CardGridSkeleton';
import type { Evento } from '@/lib/services/eventoService';

interface EventoWithTarea extends Evento {
  originado_de_tarea_id?: number;
}

export default function EstablecimientoEventosPage() {
  const { data: eventos = [], isLoading: loading, refetch } = useEventos({ page: 1, limit: 500 });
  const [showForm, setShowForm] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<EventoWithTarea | null>(null);

  const eventosArray = useMemo(() => {
    return Array.isArray(eventos) ? eventos : (eventos as { data?: EventoWithTarea[] })?.data || [];
  }, [eventos]);

  const autoGenerados = useMemo(() => {
    return eventosArray.filter((e: EventoWithTarea) => e.originado_de_tarea_id).length;
  }, [eventosArray]);

  if (loading) return <CardGridSkeleton cards={6} columns={3} />;

  const openCreate = () => { setSelectedEvento(null); setShowForm(true); };
  const openEdit = (evento: EventoWithTarea) => { setSelectedEvento(evento); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setSelectedEvento(null); };

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="max-w-[1600px] mx-auto space-y-6">

        <PageHeader
          title="Calendario de Eventos"
          subtitle="Planifica y gestiona todas las actividades"
        />

        {autoGenerados > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#af936f]/10 border border-[#af936f]/20 rounded-xl text-sm text-[#af936f]">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              <span className="font-semibold">{autoGenerados}</span> eventos creados automáticamente desde tareas
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-4 sm:p-6">
          <CalendarioEventos
            eventos={eventosArray}
            onCreateEvento={openCreate}
            onEventoClick={(evento) => openEdit(evento as EventoWithTarea)}
          />
        </div>

        <EventoForm
          isOpen={showForm}
          onClose={closeForm}
          evento={selectedEvento}
          onSuccess={() => { closeForm(); refetch(); }}
        />
      </div>
    </SimpleRoleGuard>
  );
}
