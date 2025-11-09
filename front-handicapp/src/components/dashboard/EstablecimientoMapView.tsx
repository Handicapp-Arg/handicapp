'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { establecimientoService, type Establecimiento } from '@/lib/services/establecimientoService';
import { MapPin, Building2, Star, Grid3X3, Map as MapIconSolid, LayoutGrid, Phone, Mail, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ViewMode = 'map' | 'grid' | 'split';

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

export function EstablecimientoMapView() {
  const router = useRouter();
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<Establecimiento | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]);

  // Cargar Leaflet CSS solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Importar CSS de Leaflet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      import('leaflet').then((L) => {
        // Fix para los iconos de Leaflet
        const DefaultIcon = L.Icon.Default.prototype;
        delete (DefaultIcon as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        setLeafletLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    loadEstablecimientos();
  }, []);

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
      
      console.log('🗺️ Establecimientos con coordenadas:', conCoordenadas.length);
      setEstablecimientos(conCoordenadas);
      
      // Centrar en el primer establecimiento si existe
      if (conCoordenadas.length > 0 && conCoordenadas[0].latitud && conCoordenadas[0].longitud) {
        setMapCenter([conCoordenadas[0].latitud, conCoordenadas[0].longitud]);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-red-600 mb-3">{error}</p>
          <button 
            onClick={loadEstablecimientos}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
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
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{stats.total}</span>
            <span>establecimientos</span>
          </div>
          {stats.verificados > 0 && (
            <div className="h-4 w-px bg-gray-300"></div>
          )}
          {stats.verificados > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">{stats.verificados} verificados</span>
            </div>
          )}
          {stats.conRating > 0 && (
            <>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-gray-600">{stats.conRating} con reseñas</span>
              </div>
            </>
          )}
        </div>

        {/* Controles de Vista */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="h-9"
          >
            <MapIconSolid className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Mapa</span>
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('split')}
            className="h-9"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Split</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-9"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
        </div>
      </div>

      {/* Contenido según modo de vista */}
      <div className={`${viewMode === 'split' ? 'flex gap-4' : ''}`}>
        {/* Vista Mapa */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'flex-1' : ''} ${viewMode === 'map' ? 'h-[600px]' : 'h-[700px]'} relative`}>
            {leafletLoaded ? (
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                className={`${viewMode === 'map' ? 'rounded-b-2xl' : 'rounded-xl'}`}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {establecimientos.map((establecimiento) => {
                  if (!establecimiento.latitud || !establecimiento.longitud) return null;
                  
                  return (
                    <Marker
                      key={establecimiento.id}
                      position={[establecimiento.latitud, establecimiento.longitud]}
                      eventHandlers={{
                        click: () => {
                          setSelectedEstablecimiento(establecimiento);
                          if (establecimiento.latitud && establecimiento.longitud) {
                            setMapCenter([establecimiento.latitud, establecimiento.longitud]);
                          }
                        }
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[220px]">
                          <h4 className="font-semibold text-sm mb-2 text-gray-900">{establecimiento.nombre}</h4>
                          <div className="space-y-2 text-xs">
                            <p className="flex items-center gap-1.5 text-gray-600">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="line-clamp-2">{establecimiento.direccion}</span>
                            </p>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="capitalize text-xs bg-gray-100 text-gray-700 border-0">
                                {establecimiento.tipo_establecimiento}
                              </Badge>
                              {establecimiento.verificado && (
                                <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                                  Verificado
                                </Badge>
                              )}
                            </div>

                            {/* Rating con estrellas */}
                            {establecimiento.rating_promedio && establecimiento.rating_promedio > 0 && (
                              <div className="flex items-center gap-1.5 py-1.5 px-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-amber-700">{establecimiento.rating_promedio.toFixed(1)}</span>
                                <span className="text-gray-500">({establecimiento.total_resenas || 0})</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/propietario/establecimientos/${establecimiento.id}`);
                            }}
                            className="w-full mt-3 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs hover:bg-gray-800 transition-colors font-medium"
                          >
                            Ver Detalles
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista Grid/Split - Cards laterales */}
        {(viewMode === 'grid' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-96 overflow-y-auto h-[700px] pr-2' : ''} space-y-3`}>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {establecimientos.map((establecimiento) => (
                  <EstablecimientoCard 
                    key={establecimiento.id} 
                    establecimiento={establecimiento}
                    onSelect={() => {
                      setSelectedEstablecimiento(establecimiento);
                      if (establecimiento.latitud && establecimiento.longitud) {
                        setMapCenter([establecimiento.latitud, establecimiento.longitud]);
                      }
                    }}
                    isSelected={selectedEstablecimiento?.id === establecimiento.id}
                  />
                ))}
              </div>
            )}

            {viewMode === 'split' && (
              <>
                {establecimientos.map((establecimiento) => (
                  <EstablecimientoCard 
                    key={establecimiento.id} 
                    establecimiento={establecimiento}
                    onSelect={() => {
                      setSelectedEstablecimiento(establecimiento);
                      if (establecimiento.latitud && establecimiento.longitud) {
                        setMapCenter([establecimiento.latitud, establecimiento.longitud]);
                      }
                    }}
                    isSelected={selectedEstablecimiento?.id === establecimiento.id}
                    compact
                  />
                ))}
              </>
            )}
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
      className={`group bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
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
              <span className="line-clamp-1">{establecimiento.direccion}</span>
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
              <span className="text-amber-700 font-semibold">{establecimiento.rating_promedio.toFixed(1)}</span>
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
