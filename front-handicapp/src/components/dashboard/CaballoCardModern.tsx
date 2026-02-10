"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Caballo } from '@/lib/services/caballoService';
import { 
  PencilIcon, 
  EyeIcon, 
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  SparklesIcon,
  EllipsisHorizontalIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  caballo: Caballo;
  onEdit?: (c: Caballo) => void;
  onView?: (c: Caballo) => void;
  onDelete?: (c: Caballo) => void;
};

export default function CaballoCardModern({ caballo, onEdit, onView, onDelete }: Props) {
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
    <article 
      onClick={() => onView && onView(caballo)}
      className="group relative cursor-pointer"
    >
      {/* Imagen Container - Aspect Ratio Square con overlay para texto */}
      <div className="relative aspect-square overflow-hidden bg-slate-900 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md">
        {caballo.foto_url && !imgError ? (
          <img
            src={getImageUrl(caballo.foto_url) || ''}
            alt={caballo.nombre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
             <div className="text-slate-600 flex flex-col items-center gap-2">
                <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
          </div>
        )}

        {/* Gradient Overlay - Base oscura para legibilidad del nombre */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badge Estado - Flotante estilo tag (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`
            px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md
            ${estadoConfig.bg}/90 ${estadoConfig.text} border border-white/20
          `}>
            {caballo.estado_global || '---'}
          </span>
        </div>

        {/* Menu Contextual (3 Puntos) - Top Right */}
        <div className="absolute top-3 right-3 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/20 hover:border-white/40 focus:outline-none data-[state=open]:bg-white/20 shadow-sm"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md border-slate-200">
                <DropdownMenuItem 
                   onClick={(e) => {
                     e.stopPropagation();
                     setIsFavorite(!isFavorite);
                   }}
                   className="cursor-pointer gap-2 focus:bg-blue-100 focus:text-blue-800"
                >
                   {isFavorite ? (
                      <>
                        <HeartSolid className="w-4 h-4 text-rose-500" />
                        <span className="text-rose-600 font-medium">Favorito</span>
                      </>
                   ) : (
                      <>
                        <HeartIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">Marcar como favorito</span>
                      </>
                   )}
                </DropdownMenuItem>
                
                {(onEdit || onDelete) && <DropdownMenuSeparator />}
                
                {onEdit && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(caballo);
                    }}
                    className="cursor-pointer gap-2 focus:bg-blue-100 focus:text-blue-800"
                  >
                    <PencilIcon className="w-4 h-4 text-slate-500 group-focus:text-blue-700" />
                    <span className="text-slate-700 group-focus:text-blue-800">Editar</span>
                  </DropdownMenuItem>
                )}

                {onDelete && (
                   <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(caballo);
                    }}
                    className="cursor-pointer gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Nombre dentro de la imagen (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
           {caballo._count?.eventos ? (
              <div className="flex items-center gap-1 mb-1.5">
                 <SparklesIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50" />
                 <span className="text-[11px] font-medium text-amber-100/90">{caballo._count.eventos} eventos</span>
              </div>
           ) : null}
           <h3 className="font-bold text-white text-[19px] leading-none tracking-tight truncate drop-shadow-md">
            {caballo.nombre}
           </h3>
        </div>
      </div>

      {/* Info Content - Sexo y Edad (Uno de cada lado) */}
      <div className="mt-3 flex items-center justify-between px-1">
         {/* Lado Izquierdo: Sexo */}
         <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
                caballo.sexo?.toLowerCase() === 'macho' ? 'bg-blue-400' 
                : caballo.sexo?.toLowerCase() === 'hembra' ? 'bg-pink-400' 
                : 'bg-slate-300'
            }`} />
            <span className="text-sm font-medium text-slate-600 capitalize">
               {caballo.sexo || 'Sin definir'}
            </span>
         </div>

         {/* Lado Derecho: Edad */}
         <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{edad !== null ? `${edad} años` : '--'}</span>
         </div>
      </div>
    </article>
  );
}
