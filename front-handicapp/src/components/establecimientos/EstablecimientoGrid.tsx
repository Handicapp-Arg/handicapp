'use client';

import { useState } from 'react';
import { Establecimiento } from '@/lib/services/establecimientoService';
import { EstablecimientoCard } from './EstablecimientoCard';
import { Loader } from '@/components/ui/loader';

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
        <Loader variant="section" />
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

  // Stats para filtros
  // NOTA: Si tienes stats en el padre, pásalos como props
  // Ejemplo de stats (puedes reemplazar por los reales):
  const stats = {
    total: establecimientos.length,
    verificados: establecimientos.filter(e => e.verificado).length,
    conRating: establecimientos.filter(e => e.rating_promedio && e.rating_promedio > 0).length
  };
  // Filtro local
  const [cardFilter, setCardFilter] = useState<'all' | 'verificados' | 'reseñas'>('all');
  const filteredEstablecimientos = (() => {
    if (cardFilter === 'verificados') {
      return establecimientos.filter(e => e.verificado);
    }
    if (cardFilter === 'reseñas') {
      return establecimientos.filter(e => e.rating_promedio && e.rating_promedio > 0);
    }
    return establecimientos;
  })();

  return (
    <>
      <div className="flex items-center gap-4 mb-6 mt-2 justify-end">
        <button
          className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${cardFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}
          onClick={() => setCardFilter('all')}
        >
          <span>{stats.total}</span>
          <span>establecimientos</span>
        </button>
        <button
          className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${cardFilter === 'verificados' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}
          onClick={() => setCardFilter('verificados')}
        >
          <span>{stats.verificados}</span>
          <span>verificados</span>
        </button>
        <button
          className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${cardFilter === 'reseñas' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}
          onClick={() => setCardFilter('reseñas')}
        >
          <span>{stats.conRating}</span>
          <span>con reseñas</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEstablecimientos.map((establecimiento) => (
          <EstablecimientoCard
            key={establecimiento.id}
            establecimiento={establecimiento}
            onClick={onCardClick}
          />
        ))}
      </div>
    </>
  );
}
