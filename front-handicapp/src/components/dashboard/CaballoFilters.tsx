"use client";

import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

type FilterChip = {
  id: string;
  label: string;
  value: string;
  color: string;
};

type Props = {
  activeFilters: FilterChip[];
  onRemoveFilter: (id: string) => void;
  onClearAll: () => void;
  estadoOptions?: { value: string; label: string; }[];
  onEstadoChange?: (value: string) => void;
  selectedEstado?: string;
};

export default function CaballoFilters({ 
  activeFilters, 
  onRemoveFilter, 
  onClearAll,
  estadoOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'activo', label: 'Activos' },
    { value: 'suspendido', label: 'Suspendidos' },
    { value: 'en venta', label: 'En venta' },
  ],
  onEstadoChange,
  selectedEstado = 'all'
}: Props) {
  const hasFilters = activeFilters.length > 0 || selectedEstado !== 'all';

  return (
    <div className="space-y-3">
      {/* Filter Chips Row */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <FunnelIcon className="w-4 h-4" />
            <span>Filtros:</span>
          </div>

          {activeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onRemoveFilter(filter.id)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                text-xs font-medium
                ${filter.color}
                transition-all duration-200
                hover:scale-105 hover:shadow-md
                group
              `}
            >
              <span>{filter.label}</span>
              <XMarkIcon className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          ))}

          <button
            onClick={onClearAll}
            className="
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
              text-xs font-medium
              bg-slate-100 text-slate-700
              hover:bg-slate-200
              transition-all duration-200
            "
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            <span>Limpiar todo</span>
          </button>
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {estadoOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onEstadoChange?.(option.value)}
            className={`
              px-4 py-2 rounded-xl text-sm font-semibold
              whitespace-nowrap transition-all duration-300
              ${selectedEstado === option.value
                ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-md'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
