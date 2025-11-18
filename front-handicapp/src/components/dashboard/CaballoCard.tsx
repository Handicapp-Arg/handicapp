"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Caballo } from '@/lib/services/caballoService';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

type Props = {
  caballo: Caballo;
  onEdit?: (c: Caballo) => void; // abrir modal de edición (opcional - solo si tiene permisos)
  onView?: (c: Caballo) => void; // navegar a detalle
  onDelete?: (c: Caballo) => void;
};

function CaballoCard({ caballo, onEdit, onView, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Mapa de estilos por estado - memoizado para evitar recreación
  const estadoStyles = useMemo(() => ({
    activo: { 
      bg: 'from-emerald-500/10 to-emerald-500/5', 
      text: 'text-emerald-700', 
      badge: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500/20' 
    },
    suspendido: { 
      bg: 'from-amber-500/10 to-amber-500/5', 
      text: 'text-amber-700', 
      badge: 'bg-amber-100 text-amber-800 ring-1 ring-amber-500/20' 
    },
    perdido: { 
      bg: 'from-red-500/10 to-red-500/5', 
      text: 'text-red-700', 
      badge: 'bg-red-100 text-red-800 ring-1 ring-red-500/20' 
    },
    'en venta': { 
      bg: 'from-[#af936f]/10 to-[#af936f]/5', 
      text: 'text-[#af936f]', 
      badge: 'bg-[#af936f]/10 text-[#af936f] ring-1 ring-[#af936f]/20' 
    },
    default: { 
      bg: 'from-gray-500/10 to-gray-500/5', 
      text: 'text-gray-700', 
      badge: 'bg-gray-100 text-gray-800 ring-1 ring-gray-500/20' 
    },
  } as const), []);

  // 🚀 Memoizar cálculos costosos
  const estadoKey = useMemo(() => 
    (caballo.estado_global || '').toString().toLowerCase() as keyof typeof estadoStyles, 
    [caballo.estado_global]
  );
  const estadoClass = useMemo(() => 
    estadoStyles[estadoKey] || estadoStyles.default, 
    [estadoKey, estadoStyles]
  );

  // 🚀 Memoizar funciones callback
  const copyMicrochip = useCallback(async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, []);

  const edad = useMemo(() => 
    caballo.fecha_nacimiento 
      ? Math.floor((Date.now() - new Date(caballo.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
      : null,
    [caballo.fecha_nacimiento]
  );

  // Añadir timestamp para evitar caché de imágenes
  const getImageUrl = useCallback((url?: string | null) => {
    if (!url) return null;
    // Si ya tiene parámetros, agregar &t=, si no, agregar ?t=
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }, []);

  return (
    <article className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      {/* Gradiente sutil superior según estado */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${estadoClass.bg}`}></div>
      
      <div className="relative">
        {/* Imagen con overlay en hover */}
        <div className="relative w-full h-52 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {caballo.foto_url && !imgError ? (
            <button
              type="button"
              onClick={() => onView && onView(caballo)}
              className="w-full h-full block relative group/img"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(caballo.foto_url) || ''}
                alt={caballo.nombre}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                loading="lazy"
                onError={() => setImgError(true)}
              />
              {/* Overlay oscuro en hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
              {/* Texto "Ver detalles" en hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-[#0f172a] rounded-lg font-medium text-sm shadow-lg">
                  Ver detalles
                </span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onView && onView(caballo)}
              className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center gap-3 group/placeholder relative overflow-hidden"
            >
              {/* Pattern de fondo sutil */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              
              {/* Ícono simple de imagen con trofeo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover/placeholder:scale-110 group-hover/placeholder:shadow-xl transition-all duration-300">
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="text-slate-300 group-hover/placeholder:text-slate-400 transition-colors"
                    strokeWidth="1.5"
                  >
                    {/* Marco de imagen */}
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Montañas/Paisaje simple */}
                    <path d="M3 17l4-4 3 3 5-5 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Sol/círculo */}
                    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              
              {/* Texto descriptivo */}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400 group-hover/placeholder:text-slate-500 transition-colors">
                  Sin imagen
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click para ver detalles
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Botón de editar - más sutil y moderno */}
        {onEdit && (
          <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onEdit(caballo)}
              aria-label="Editar caballo"
              title="Editar"
              className="p-2.5 rounded-xl bg-white/95 backdrop-blur-sm text-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Header: Nombre con badges inline */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <button 
              type="button" 
              onClick={() => onView && onView(caballo)} 
              className="text-left flex-1 min-w-0 group/title"
            >
              <h3 className="text-lg font-bold text-gray-900 group-hover/title:text-[#0f172a] transition-colors truncate">
                {caballo.nombre}
              </h3>
            </button>
            
            {/* Badges: Estado y Edad */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoClass.badge}`}>
                {caballo.estado_global || '—'}
              </span>
              {edad && (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {edad} {edad === 1 ? 'año' : 'años'}
                </span>
              )}
            </div>
          </div>
          
          {/* Establecimiento - Siempre visible para mantener altura uniforme */}
          <div className="min-h-[24px]">
            {caballo.asociaciones_establecimientos?.[0]?.establecimiento?.nombre ? (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="text-xs">📍</span>
                {caballo.asociaciones_establecimientos[0].establecimiento.nombre}
              </p>
            ) : (
              <p className="text-sm text-gray-400 flex items-center gap-1 italic">
                <span className="text-xs">📍</span>
                Sin establecimiento asignado
              </p>
            )}
          </div>
        </div>

        {/* Separador */}
        <div className="mb-4 pb-4 border-b border-gray-100"></div>

        {/* Info principal - Grid balanceado */}
        <div className="space-y-3 mb-4">
          {/* Fila 1: Sexo y Pelaje */}
          <div className="flex items-center justify-between gap-8">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Sexo</div>
              <div className="text-sm font-semibold text-gray-900">{caballo.sexo || '—'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 mb-1">Pelaje</div>
              <div className="text-sm font-semibold text-gray-900">{caballo.pelaje || '—'}</div>
            </div>
          </div>

          {/* Fila 2: Raza y Nacimiento */}
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500 mb-1">Raza</div>
              <div className="text-sm font-semibold text-gray-900 truncate" title={caballo.raza || '—'}>
                {caballo.raza || '—'}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-medium text-gray-500 mb-1">Nacimiento</div>
              <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {caballo.fecha_nacimiento 
                  ? new Date(caballo.fecha_nacimiento).toLocaleDateString('es-AR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })
                  : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Microchip - Destacado */}
        {caballo.microchip && (
          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500 mb-1">Microchip</div>
                <div className="font-mono text-sm font-semibold text-gray-900 truncate">
                  {caballo.microchip}
                </div>
              </div>
              <button
                onClick={() => caballo.microchip && copyMicrochip(caballo.microchip)}
                className="flex-shrink-0 px-3 py-1.5 bg-white hover:bg-[#0f172a] text-gray-700 hover:text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow border border-gray-200 hover:border-[#0f172a]"
                aria-label="Copiar microchip"
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {/* Footer: Acciones */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={() => onView && onView(caballo)}
            className="flex-1 text-sm font-medium text-[#0f172a] hover:text-white bg-gray-50 hover:bg-[#0f172a] transition-all duration-200 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 group/cta"
          >
            <span>Ver perfil completo</span>
            <svg 
              className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {onDelete && (
            <button
              onClick={() => onDelete(caballo)}
              aria-label="Eliminar caballo"
              title="Eliminar caballo"
              className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// 🚀 Exportar con React.memo para evitar re-renders innecesarios
export default React.memo(CaballoCard);
