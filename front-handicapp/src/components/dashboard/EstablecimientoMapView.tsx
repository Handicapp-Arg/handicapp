'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { establecimientoService, type Establecimiento } from '@/lib/services/establecimientoService';
import { MapPin, Building2, Star, Map as MapIconSolid, LayoutGrid, Phone, Mail, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import type L from 'leaflet';

type ViewMode = 'map' | 'split';

// Cargar Leaflet solo en el cliente
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Componente para manejar eventos del mapa (debe estar dentro de MapContainer)
const MapEventsHandler = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMapEvents } = mod;
    return {
      default: function MapController({ center, zoom, shouldAnimate, onAnimationComplete }: { 
        center: [number, number]; 
        zoom: number; 
        shouldAnimate: boolean;
        onAnimationComplete: () => void;
      }) {
        const map = useMapEvents({});
        
        React.useEffect(() => {
          // Solo mover el mapa si shouldAnimate es true (evita movimientos en hover)
          if (map && shouldAnimate && center && center[0] && center[1]) {
            // Verificar si las coordenadas son válidas
            const [lat, lng] = center;
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              map.setView(center, zoom, { 
                animate: true, 
                duration: 0.8,
                easeLinearity: 0.5
              });
              // Resetear el flag después de iniciar la animación
              setTimeout(() => {
                onAnimationComplete();
              }, 100);
            }
          }
        }, [center, zoom, shouldAnimate, map, onAnimationComplete]);
        
        return null;
      }
    };
  }),
  { ssr: false }
);

interface EstablecimientoMapViewProps {
  /** Datos precargados desde el padre para evitar doble fetch */
  establecimientos?: Establecimiento[];
  /** Indica si los datos están cargando en el padre */
  isLoading?: boolean;
}

export function EstablecimientoMapView({ 
  establecimientos: establecimientosProp,
  isLoading: isLoadingProp 
}: EstablecimientoMapViewProps = {}) {
  const router = useRouter();
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(establecimientosProp || []);
  const [loading, setLoading] = useState(establecimientosProp ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]);
  const [mapZoom, setMapZoom] = useState(11);
  const [shouldAnimateMap, setShouldAnimateMap] = useState(false);

  // Cargar Leaflet CSS solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Importar CSS de Leaflet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Agregar estilos personalizados para el mapa
      const style = document.createElement('style');
      style.textContent = `
        .custom-marker {
          background: transparent !important;
          border: none !important;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .custom-marker:hover {
          transform: translateY(-4px) scale(1.05);
          z-index: 1000 !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        
        .leaflet-popup-tip-container {
          display: none !important;
        }
        
        .custom-popup .leaflet-popup-close-button {
          color: white !important;
          font-size: 24px !important;
          padding: 8px !important;
          width: 32px !important;
          height: 32px !important;
          background: rgba(0,0,0,0.3) !important;
          border-radius: 50% !important;
          top: 8px !important;
          right: 8px !important;
          z-index: 10;
        }
        
        .custom-popup .leaflet-popup-close-button:hover {
          background: rgba(0,0,0,0.5) !important;
        }
      `;
      document.head.appendChild(style);

      import('leaflet').then((L) => {
        // Crear iconos personalizados por tipo de establecimiento
        const createCustomIcon = (color: string) => {
          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="position: relative;">
                <div style="
                  width: 32px;
                  height: 32px;
                  background: ${color};
                  border: 3px solid white;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                  ">🐴</div>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          });
        };

        // Iconos por tipo
        (window as { customIcons?: Record<string, unknown> }).customIcons = {
          haras: createCustomIcon('#10b981'),     // Verde
          turf: createCustomIcon('#10b981'),      // Verde
          polo: createCustomIcon('#3b82f6'),      // Azul
          salto: createCustomIcon('#f59e0b'),     // Naranja
          doma: createCustomIcon('#8b5cf6'),      // Púrpura
          mixto: createCustomIcon('#6366f1'),     // Índigo
          default: createCustomIcon('#6b7280'),   // Gris
        };

        setLeafletLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    // Si tenemos datos del padre, usarlos en vez de hacer fetch
    if (establecimientosProp) {
      setEstablecimientos(establecimientosProp);
      setLoading(isLoadingProp || false);
    } else {
      // Solo hacer fetch si no hay datos del padre
      loadEstablecimientos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establecimientosProp, isLoadingProp]);

  const loadEstablecimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await establecimientoService.getAll({
        page: 1,
        limit: 100,
        sortBy: 'nombre',
        sortOrder: 'ASC',
        estado: 'activo'
      });
      
      // Manejar diferentes estructuras de respuesta
      let establecimientosArray: Establecimiento[] = [];
      
      if (Array.isArray(response)) {
        establecimientosArray = response;
      } else if (response && typeof response === 'object') {
        const r = response as { data?: unknown; items?: unknown; [key: string]: unknown };
        const dataItems = (r.data as { items?: unknown; establecimientos?: unknown; [key: string]: unknown });
        establecimientosArray = (dataItems?.items || 
                                dataItems?.establecimientos || 
                                r.items || 
                                r.data || 
                                []) as Establecimiento[];
      }
      
      // Filtrar solo los que tienen coordenadas
      const conCoordenadas = establecimientosArray.filter(
        est => est.latitud && est.longitud
      );
      
      setEstablecimientos(conCoordenadas);
      
      // Calcular centro promedio de todos los establecimientos
      if (conCoordenadas.length > 0) {
        const sumLat = conCoordenadas.reduce((sum, est) => sum + (est.latitud || 0), 0);
        const sumLng = conCoordenadas.reduce((sum, est) => sum + (est.longitud || 0), 0);
        const avgLat = sumLat / conCoordenadas.length;
        const avgLng = sumLng / conCoordenadas.length;
        
        // Validar que las coordenadas promedio sean válidas
        if (!isNaN(avgLat) && !isNaN(avgLng) && avgLat >= -90 && avgLat <= 90 && avgLng >= -180 && avgLng <= 180) {
          setMapCenter([avgLat, avgLng]);
          setMapZoom(11);
          setShouldAnimateMap(true);
        }
      }
    } catch (err) {
      console.error('❌ Error cargando establecimientos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar establecimientos');
      setEstablecimientos([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular centro del mapa (ya no es necesario con el estado)
  const stats = useMemo(() => ({
    total: establecimientos.length,
    verificados: establecimientos.filter(e => e.verificado).length,
    conRating: establecimientos.filter(e => e.rating_promedio && e.rating_promedio > 0).length
  }), [establecimientos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader variant="section" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-red-600 mb-3">{error}</p>
        </div>
      </div>
    );
  }

  if (establecimientos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No hay establecimientos con ubicación disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Cards grid a la izquierda */}
      <div className="flex-1 min-w-0">
        {/* Aquí debe ir el grid de cards existente, importado como componente */}
        {/* <EstablecimientoGrid establecimientos={establecimientos} /> */}
      </div>
      {/* Mapa a la derecha, alineado con el grid de cards (no los botones) */}
      <div className="w-[700px] max-w-full mt-[56px]">
        {leafletLoaded ? (
          <MapContainer
            key={`map-${establecimientos.length}`}
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ height: '700px', width: '100%' }}
            className="rounded-xl"
          >
            <MapEventsHandler 
              center={mapCenter} 
              zoom={mapZoom} 
              shouldAnimate={shouldAnimateMap}
              onAnimationComplete={() => setShouldAnimateMap(false)}
            />
            <TileLayer
              attribution='&copy; <a href=\"https://carto.com/\">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            {/* Sin markers */}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-[700px] bg-gray-100 rounded-xl">
            <Loader variant="section" />
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de Card reutilizable
function EstablecimientoCard({ 
  establecimiento, 
  onSelect,
  isSelected,
  compact = false
}: { 
  establecimiento: Establecimiento; 
  onSelect: () => void;
  isSelected?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <div 
      className={`group bg-white border rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg border-blue-500' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${compact ? 'text-sm mb-0.5' : 'text-base mb-1'} line-clamp-2`}>
              {establecimiento.nombre}
            </h3>
            <div className={`flex items-center gap-1.5 text-gray-500 ${compact ? 'text-xs' : 'text-xs'}`}>
              <MapPin className={`flex-shrink-0 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
              <span className="line-clamp-1">
                {[establecimiento.direccion_calle, establecimiento.ciudad]
                  .filter(Boolean)
                  .join(', ') || 'Sin dirección'}
              </span>
            </div>
          </div>
          {establecimiento.verificado && (
            <div className="flex-shrink-0 ml-2">
              <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className={`${compact ? 'p-3' : 'p-4'} space-y-${compact ? '2' : '3'}`}>
        {/* Badges y Rating */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="capitalize text-xs bg-gray-100 text-gray-700 border-0">
            {establecimiento.tipo_establecimiento}
          </Badge>
          {establecimiento.rating_promedio && establecimiento.rating_promedio > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 border-amber-200 text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-amber-700 font-semibold">{Number(establecimiento.rating_promedio).toFixed(1)}</span>
              {!compact && establecimiento.total_resenas && establecimiento.total_resenas > 0 && (
                <span className="text-gray-500">({establecimiento.total_resenas})</span>
              )}
            </Badge>
          )}
        </div>

        {/* Stats - sin emojis */}
        {!compact && (establecimiento.superficie_hectareas || establecimiento.cantidad_boxes) && (
          <div className="flex gap-3 text-xs text-gray-600">
            {establecimiento.superficie_hectareas && (
              <div className="flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">{establecimiento.superficie_hectareas}</span>
                <span className="text-gray-500">ha</span>
              </div>
            )}
            {establecimiento.cantidad_boxes && (
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="font-medium">{establecimiento.cantidad_boxes}</span>
                <span className="text-gray-500">boxes</span>
              </div>
            )}
          </div>
        )}

        {/* Contacto */}
        {!compact && (establecimiento.telefono || establecimiento.email) && (
          <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
            {establecimiento.telefono && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span>{establecimiento.telefono}</span>
              </div>
            )}
            {establecimiento.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{establecimiento.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/propietario/establecimientos/${establecimiento.id}`);
          }}
          className={`w-full ${compact ? 'mt-2 py-2' : 'mt-2 py-2.5'} px-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm`}
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
}
