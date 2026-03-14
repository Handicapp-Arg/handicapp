'use client';

import React, { useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Building2 } from 'lucide-react';
import { useStats } from '@/lib/hooks/useStats';
import { useEstablecimientos } from '@/lib/hooks/useEstablecimientosQuery';
import type { Establecimiento } from '@/lib/services/establecimientoService';
import CardGridSkeleton from '@/components/skeletons/CardGridSkeleton';
import { EstablecimientoCard } from '@/components/establecimientos/EstablecimientoCard';
import { EstablecimientoMapView } from '@/components/dashboard/EstablecimientoMapView';

type FilterType = 'all' | 'verificados' | 'reseñas';

function FilterTabs({
  establecimientos,
  active,
  onChange,
}: {
  establecimientos: Establecimiento[];
  active: FilterType;
  onChange: (f: FilterType) => void;
}) {
  const stats = {
    total: establecimientos.length,
    verificados: establecimientos.filter(e => e.verificado).length,
    conRating: establecimientos.filter(e => e.rating_promedio && e.rating_promedio > 0).length,
  };

  const tabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: stats.total },
    { key: 'verificados', label: 'Verificados', count: stats.verificados },
    { key: 'reseñas', label: 'Con reseñas', count: stats.conRating },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${
            active === key
              ? 'bg-[#af936f]/10 text-[#af936f] border border-[#af936f]/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
          }`}
        >
          <span className="font-bold">{count}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function PropietarioEstablecimientosPage() {
  const [cardFilter, setCardFilter] = useState<FilterType>('all');
  const { stats, loading: statsLoading } = useStats();
  const { data: establecimientosResponse, isLoading: establecimientosLoading } = useEstablecimientos();

  let establecimientos: Establecimiento[] = [];

  if (establecimientosResponse) {
    if (Array.isArray(establecimientosResponse)) {
      establecimientos = establecimientosResponse;
    } else if (typeof establecimientosResponse === 'object') {
      const resp = establecimientosResponse as Record<string, unknown>;
      const data = resp.data as Record<string, unknown> | Establecimiento[] | undefined;

      if (Array.isArray(data)) {
        establecimientos = data;
      } else if (data && typeof data === 'object') {
        establecimientos =
          (data.items as Establecimiento[]) ||
          (data.establecimientos as Establecimiento[]) ||
          [];
      } else {
        establecimientos =
          (resp.items as Establecimiento[]) ||
          (resp.establecimientos as Establecimiento[]) ||
          [];
      }
    }
  }

  const establecimientosConCaballos = establecimientos.filter(
    est => est.mis_caballos && est.mis_caballos.length > 0
  ).length;

  const isLoading = statsLoading || establecimientosLoading;

  if (isLoading) return <CardGridSkeleton cards={6} columns={3} />;

  const hasCaballos = (stats.caballos?.total || 0) > 0;

  if (!hasCaballos && establecimientosConCaballos === 0) {
    return (
      <SimpleRoleGuard roles={['propietario']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={Building2}
            title="No tienes caballos registrados"
            description="Para ver establecimientos, primero debes registrar tu caballo en uno de ellos."
            action={{
              label: 'Registrar mi primer caballo',
              href: '/propietario/caballos',
            }}
          />
        </div>
      </SimpleRoleGuard>
    );
  }

  const filteredEstablecimientos = establecimientos.filter(est => {
    if (cardFilter === 'verificados') return est.verificado;
    if (cardFilter === 'reseñas') return est.rating_promedio && est.rating_promedio > 0;
    return true;
  });

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="max-w-[1600px] mx-auto">
        <PageHeader
          title="Mis Establecimientos"
          subtitle="Establecimientos donde tenés caballos alojados"
        />

        <FilterTabs
          establecimientos={establecimientos}
          active={cardFilter}
          onChange={setCardFilter}
        />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          {/* Cards grid */}
          <div className="flex-1 min-w-0">
            {filteredEstablecimientos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEstablecimientos.map(est => (
                  <EstablecimientoCard key={est.id} establecimiento={est} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="Sin resultados"
                description="No hay establecimientos que coincidan con el filtro seleccionado."
                size="sm"
              />
            )}
          </div>

          {/* Map */}
          <div className="lg:w-[420px] xl:w-[480px] flex-shrink-0 min-h-[400px] lg:min-h-[600px]">
            <EstablecimientoMapView
              establecimientos={filteredEstablecimientos}
              isLoading={establecimientosLoading}
            />
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
