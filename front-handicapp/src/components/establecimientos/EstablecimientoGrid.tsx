'use client';

import { Establecimiento } from '@/lib/services/establecimientoService';
import { EstablecimientoCard } from './EstablecimientoCard';
import { LoadingSpinnerCard } from '@/components/ui/loading-spinner';

interface EstablecimientoGridProps {
  establecimientos: Establecimiento[];
  loading?: boolean;
  onCardClick?: (establecimiento: Establecimiento) => void;
}

export function EstablecimientoGrid({
  establecimientos,
  loading = false,
  onCardClick,
}: EstablecimientoGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinnerCard label="Cargando establecimientos..." />
      </div>
    );
  }

  if (establecimientos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron establecimientos
        </h3>
        <p className="text-gray-600">
          Intenta ajustar los filtros para ver más resultados
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {establecimientos.map((establecimiento) => (
        <EstablecimientoCard
          key={establecimiento.id}
          establecimiento={establecimiento}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
