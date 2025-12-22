"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Caballo } from '@/lib/services/caballoService';
import { 
  PencilIcon, 
  EyeIcon, 
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

type Props = {
  caballo: Caballo;
  onEdit?: (c: Caballo) => void;
  onView?: (c: Caballo) => void;
  onDelete?: (c: Caballo) => void;
};

export default function CaballoCardModern({ caballo, onEdit, onView }: Props) {
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Calcular edad
  const edad = useMemo(() => 
    caballo.fecha_nacimiento 
      ? Math.floor((Date.now() - new Date(caballo.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
      : null,
    [caballo.fecha_nacimiento]
  );

  // Estilos por estado - siguiendo paleta navy/emerald
  const estadoConfig = useMemo(() => {
    const configs = {
      activo: { 
        gradient: 'from-emerald-500 to-green-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        ring: 'ring-emerald-500/20',
        glow: 'shadow-emerald-500/20'
      },
      suspendido: { 
        gradient: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        ring: 'ring-amber-500/20',
        glow: 'shadow-amber-500/20'
      },
      perdido: { 
        gradient: 'from-red-500 to-rose-600',
        bg: 'bg-red-50',
        text: 'text-red-700',
        ring: 'ring-red-500/20',
        glow: 'shadow-red-500/20'
      },
      'en venta': { 
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        ring: 'ring-blue-500/20',
        glow: 'shadow-blue-500/20'
      },
      default: { 
        gradient: 'from-slate-500 to-gray-600',
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        ring: 'ring-slate-500/20',
        glow: 'shadow-slate-500/20'
      },
    } as const;
    
    const key = (caballo.estado_global || '').toString().toLowerCase() as keyof typeof configs;
    return configs[key] || configs.default;
  }, [caballo.estado_global]);

  const getImageUrl = useCallback((url?: string | null) => {
    if (!url) return null;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }, []);

  return (
    <article className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200/80 hover:border-slate-300">
      {/* Imagen Container */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {caballo.foto_url && !imgError ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(caballo.foto_url) || ''}
              alt={caballo.nombre}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
            {/* Gradient overlay bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-full relative overflow-hidden">
            {/* Pattern de fondo */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
            
            {/* Gradient orbs */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-emerald-600/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
            
            {/* Icono caballo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/20">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Top Actions Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Badge Estado */}
          <div className={`
            px-3 py-1.5 rounded-full text-xs font-bold
            bg-gradient-to-r ${estadoConfig.gradient}
            text-white shadow-lg ${estadoConfig.glow}
            backdrop-blur-sm
            transform transition-all duration-300
            group-hover:scale-105
          `}>
            {caballo.estado_global || 'Sin estado'}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-lg hover:scale-110"
              aria-label="Marcar como favorito"
            >
              {isFavorite ? (
                <HeartSolid className="w-4 h-4 text-rose-500" />
              ) : (
                <HeartIcon className="w-4 h-4 text-slate-700" />
              )}
            </button>
            
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(caballo);
                }}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-emerald-500 hover:text-white transition-all duration-200 shadow-lg hover:scale-110"
                aria-label="Editar"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Info Bar - sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <button 
            onClick={() => onView && onView(caballo)}
            className="w-full text-left group/title"
          >
            <h3 className="text-xl font-bold text-white mb-1 group-hover/title:text-emerald-300 transition-colors drop-shadow-lg">
              {caballo.nombre}
            </h3>
            <p className="text-sm text-white/80 font-medium">
              {caballo.raza || 'Sin raza especificada'}
            </p>
          </button>
        </div>
      </div>

      {/* Content - Info Cards */}
      <div className="p-5 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Edad */}
          {edad !== null && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="p-1.5 rounded-md bg-slate-200/50">
                <CalendarIcon className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">Edad</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {edad} {edad === 1 ? 'año' : 'años'}
                </p>
              </div>
            </div>
          )}

          {/* Establecimiento */}
          {caballo.asociaciones_establecimientos && caballo.asociaciones_establecimientos.length > 0 && caballo.asociaciones_establecimientos[0].establecimiento && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <div className="p-1.5 rounded-md bg-emerald-200/50">
                <MapPinIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-600 font-medium">Haras</p>
                <p className="text-sm font-bold text-emerald-900 truncate">
                  {caballo.asociaciones_establecimientos[0].establecimiento.nombre}
                </p>
              </div>
            </div>
          )}

          {/* Eventos */}
          {caballo._count?.eventos !== undefined && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
              <div className="p-1.5 rounded-md bg-blue-200/50">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-medium">Eventos</p>
                <p className="text-sm font-bold text-blue-900">
                  {caballo._count.eventos}
                </p>
              </div>
            </div>
          )}

          {/* Microchip */}
          {caballo.microchip && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="p-1.5 rounded-md bg-slate-200/50">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">Chip</p>
                <p className="text-sm font-bold text-slate-900 truncate font-mono">
                  {caballo.microchip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onView && onView(caballo)}
          className="
            w-full py-3 px-4 rounded-xl
            bg-gradient-to-r from-slate-900 to-slate-800
            hover:from-emerald-600 hover:to-green-600
            text-white font-semibold text-sm
            transition-all duration-300
            shadow-lg hover:shadow-xl hover:shadow-emerald-500/20
            flex items-center justify-center gap-2
            group/btn
          "
        >
          <EyeIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span>Ver detalles completos</span>
        </button>
      </div>
    </article>
  );
}
