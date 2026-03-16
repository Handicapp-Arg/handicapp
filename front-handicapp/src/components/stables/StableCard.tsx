'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Establecimiento } from '@/lib/services/stableService';

interface EstablecimientoCardProps {
  establecimiento: Establecimiento;
  onClick?: (establecimiento: Establecimiento) => void;
}

export function EstablecimientoCard({ establecimiento, onClick }: EstablecimientoCardProps) {
  const imagen = establecimiento.imagenes && establecimiento.imagenes.length > 0
    ? establecimiento.imagenes[0]
    : '/placeholder-establecimiento.jpg';

  return (
    <div
      onClick={() => onClick?.(establecimiento)}
      className="cursor-pointer bg-white rounded-md overflow-hidden border border-gray-200 hover:bg-gray-50"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-200 overflow-hidden">
        <Image
          src={imagen}
          alt={establecimiento.nombre}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {establecimiento.nombre}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">
            {[establecimiento.ciudad, establecimiento.provincia]
              .filter(Boolean)
              .join(', ') || 'Sin ubicación'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          {establecimiento.superficie_hectareas && (
            <div>
              <span className="font-semibold text-gray-900">
                {establecimiento.superficie_hectareas}
              </span>{' '}
              ha
            </div>
          )}
          {establecimiento.cantidad_boxes && (
            <div>
              <span className="font-semibold text-gray-900">
                {establecimiento.cantidad_boxes}
              </span>{' '}
              boxes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
