"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Caballo } from '@/lib/services/horseService';

type Props = {
  caballo: Caballo;
  onEdit?: (c: Caballo) => void;
  onView?: (c: Caballo) => void;
  onDelete?: (c: Caballo) => void;
};

const STATUS_DOT: Record<string, string> = {
  activo: 'bg-green-500',
  inactivo: 'bg-amber-400',
  vendido: 'bg-gray-400',
  fallecido: 'bg-gray-300',
};

export default function CaballoCardModern({ caballo, onEdit, onView, onDelete }: Props) {
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const edad = caballo.fecha_nacimiento
    ? Math.floor((Date.now() - new Date(caballo.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const meta = [caballo.raza, edad !== null ? `${edad} a` : null].filter(Boolean).join(' · ');

  return (
    <div
      onClick={() => onView?.(caballo)}
      className="group relative bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-300"
    >
      {/* Photo */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {caballo.foto_url && !imgError ? (
          <Image
            src={caballo.foto_url}
            alt={caballo.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-xs">Sin foto</span>
          </div>
        )}

        {/* Status dot */}
        <span className={`absolute top-2 left-2 w-2 h-2 rounded-full ${STATUS_DOT[caballo.estado_global] ?? 'bg-gray-400'}`} />

        {/* Actions menu */}
        {(onEdit || onDelete) && (
          <div className="absolute top-1 right-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-sm z-20 py-1">
                  {onEdit && (
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(caballo); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <PencilIcon className="w-3.5 h-3.5" /> Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(caballo); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-gray-900 truncate">{caballo.nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{meta || '—'}</p>
      </div>
    </div>
  );
}
