'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Establecimiento } from '@/lib/services/establecimientoService';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EstablecimientoCardProps {
  establecimiento: Establecimiento;
  onClick?: (establecimiento: Establecimiento) => void;
}

export function EstablecimientoCard({ establecimiento, onClick }: EstablecimientoCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imagenes = establecimiento.imagenes && establecimiento.imagenes.length > 0
    ? establecimiento.imagenes
    : ['/placeholder-establecimiento.jpg'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  return (
    <div
      onClick={() => onClick?.(establecimiento)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Image Carousel */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <Image
          src={imagenes[currentImageIndex]}
          alt={establecimiento.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Navigation Arrows */}
        {imagenes.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {imagenes.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    index === currentImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/60'
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {establecimiento.verificado && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verificado
            </Badge>
          )}
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg capitalize">
            {establecimiento.tipo_establecimiento}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
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

        {/* Rating */}
        {establecimiento.rating_promedio !== undefined && establecimiento.rating_promedio > 0 ? (
          <div className="mb-3">
            <RatingStars
              rating={establecimiento.rating_promedio}
              totalReviews={establecimiento.total_resenas}
              size="sm"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-3">Sin reseñas aún</div>
        )}

        {/* Description Preview */}
        {establecimiento.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {establecimiento.descripcion}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
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
