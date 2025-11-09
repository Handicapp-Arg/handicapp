'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { Establecimiento } from '@/lib/services/establecimientoService';
import { RatingStars } from '@/components/ui/RatingStars';

interface EstablecimientoMapProps {
  establecimientos: Establecimiento[];
  center?: LatLngExpression;
  zoom?: number;
  onEstablecimientoClick?: (establecimiento: Establecimiento) => void;
}

function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

export function EstablecimientoMap({
  establecimientos,
  center = [-34.6037, -58.3816], // Buenos Aires por defecto
  zoom = 12,
  onEstablecimientoClick,
}: EstablecimientoMapProps) {
  const [mounted, setMounted] = useState(false);

  // Crear el icono de forma segura solo en el cliente
  const defaultIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    
    return new Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !defaultIcon) {
    return (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} />
      
      {establecimientos
        .filter(est => est.latitud && est.longitud)
        .map((establecimiento) => (
          <Marker
            key={`marker-${establecimiento.id}`}
            position={[establecimiento.latitud!, establecimiento.longitud!]}
            icon={defaultIcon}
          >
            <Popup className="establecimiento-popup">
              <div className="min-w-[250px] p-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 pr-2">
                    {establecimiento.nombre}
                  </h3>
                  {establecimiento.verificado && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>

                {/* Rating */}
                {establecimiento.rating_promedio !== undefined && establecimiento.rating_promedio > 0 && (
                  <div className="mb-2">
                    <RatingStars
                      rating={establecimiento.rating_promedio}
                      totalReviews={establecimiento.total_resenas}
                      size="sm"
                    />
                  </div>
                )}

                {/* Tipo */}
                <div className="text-xs text-gray-600 mb-2 capitalize">
                  {establecimiento.tipo_establecimiento}
                </div>

                {/* Ubicación */}
                <div className="flex items-start gap-1 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {[establecimiento.ciudad, establecimiento.provincia]
                      .filter(Boolean)
                      .join(', ') || 'Sin ubicación especificada'}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() => onEstablecimientoClick?.(establecimiento)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
