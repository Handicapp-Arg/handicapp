'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Cargar componentes de Leaflet solo en el cliente
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
interface AddressData {
  direccion_calle: string;
  direccion_numero?: string;
  direccion_complemento?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
}

interface LeafletAddressPickerProps {
  value?: AddressData;
  onChange: (data: AddressData) => void;
}

// Componente para actualizar el mapa cuando cambian las coordenadas
const MapController = dynamic(
  () => Promise.all([
    import('react-leaflet'),
    import('react')
  ]).then(([leafletMod, reactMod]) => {
    const { useMap } = leafletMod;
    const { useEffect } = reactMod;
    const MapControllerComponent = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
      const map = useMap();
      
      useEffect(() => {
        if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
          map.setView(center, zoom, {
            animate: true,
            duration: 0.8
          });
        }
      }, [center, zoom, map]);
      
      return null;
    };
    return { default: MapControllerComponent };
  }),
  { ssr: false }
);

// Componente para manejar eventos del mapa (debe estar dentro de MapContainer)
const MapClickHandler = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMapEvents } = mod;
    const MapClickHandlerComponent = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
      useMapEvents({
        click: (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    };
    return { default: MapClickHandlerComponent };
  }),
  { ssr: false }
);

// Componente para manejar el arrastre del marcador
function DraggableMarker({ 
  position, 
  onDragEnd,
  icon
}: { 
  position: [number, number]; 
  onDragEnd: (lat: number, lng: number) => void;
  icon?: Icon;
}) {
  const [markerPosition, setMarkerPosition] = useState(position);

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  const eventHandlers = useMemo(
    () => ({
      dragend: (e: any) => {
        const marker = e.target;
        const newPosition = marker.getLatLng();
        setMarkerPosition([newPosition.lat, newPosition.lng]);
        onDragEnd(newPosition.lat, newPosition.lng);
      },
    }),
    [onDragEnd]
  );

  return (
    <Marker
      draggable={true}
      position={markerPosition}
      eventHandlers={eventHandlers}
      icon={icon}
    />
  );
}

export const LeafletAddressPicker: React.FC<LeafletAddressPickerProps> = ({
  value,
  onChange,
}) => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Si ya hay ciudad/provincia/pais, asumimos que se seleccionó una dirección
  const [hasSelectedAddress, setHasSelectedAddress] = useState(
    !!(value?.ciudad || value?.provincia || value?.pais)
  );
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(
    value?.latitud && value?.longitud 
      ? [value.latitud, value.longitud]
      : [-34.6037, -58.3816] // Buenos Aires por defecto
  );
  const [mapZoom, setMapZoom] = useState(value?.latitud && value?.longitud ? 15 : 10);

  // Crear el icono de marcador
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

  // Función para buscar direcciones usando Nominatim
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ar&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HandicApp/1.0'
          }
        }
      );
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error buscando dirección:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Función para geocodificación inversa (obtener dirección desde coordenadas)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'HandicApp/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        // Solo extraer ciudad, provincia, país y código postal
        // Mantener calle y número actuales o dejarlos vacíos
        const codigo_postal = addr.postcode || '';
        const ciudad = addr.city || addr.town || addr.village || addr.municipality || '';
        const provincia = addr.state || addr.region || '';
        const pais = addr.country || 'Argentina';

        onChange({
          direccion_calle: value?.direccion_calle || '',
          direccion_numero: value?.direccion_numero || '',
          codigo_postal: codigo_postal || undefined,
          ciudad: ciudad || undefined,
          provincia: provincia || undefined,
          pais: pais || undefined,
          latitud: lat,
          longitud: lng
        });

        // Actualizar el mapa
        setMapCenter([lat, lng]);
        setMapZoom(15);
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
    }
  }, [onChange, value]);

  // Manejar selección de resultado de búsqueda
  const handleSelectResult = useCallback((result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    const addr = result.address || {};
    // Solo extraer ciudad, provincia y país - calle y número se dejan para que el usuario complete
    const codigo_postal = addr.postcode || '';
    const ciudad = addr.city || addr.town || addr.village || addr.municipality || '';
    const provincia = addr.state || addr.region || '';
    const pais = addr.country || 'Argentina';

    // Mantener los valores actuales de calle y número si existen, o dejarlos vacíos
    onChange({
      direccion_calle: value?.direccion_calle || '',
      direccion_numero: value?.direccion_numero || '',
      codigo_postal: codigo_postal || undefined,
      ciudad: ciudad || undefined,
      provincia: provincia || undefined,
      pais: pais || undefined,
      latitud: lat,
      longitud: lng
    });

    setHasSelectedAddress(true);
    setMapCenter([lat, lng]);
    setMapZoom(15);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  }, [onChange, value]);

  // Manejar clic en el mapa
  const handleMapClick = useCallback((lat: number, lng: number) => {
    reverseGeocode(lat, lng);
    setHasSelectedAddress(true);
  }, [reverseGeocode]);

  // Manejar arrastre del marcador
  const handleMarkerDrag = useCallback((lat: number, lng: number) => {
    reverseGeocode(lat, lng);
    setHasSelectedAddress(true);
  }, [reverseGeocode]);

  // Función para geocodificación directa (buscar coordenadas desde dirección)
  const forwardGeocode = useCallback(async (calle: string, numero?: string) => {
    // Solo buscar si hay al menos ciudad o provincia seleccionada para mejorar precisión
    if (!calle || calle.length < 3 || (!value?.ciudad && !value?.provincia)) {
      return;
    }
    
    try {
      // Construir la dirección completa
      let addressQuery = calle;
      if (numero) {
        addressQuery = `${calle} ${numero}`;
      }
      
      // Agregar ciudad, provincia y país si están disponibles para mejorar la precisión
      const addressParts = [addressQuery];
      if (value?.ciudad) addressParts.push(value.ciudad);
      if (value?.provincia) addressParts.push(value.provincia);
      if (value?.pais) addressParts.push(value.pais);
      
      const fullAddress = addressParts.join(', ');
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=ar&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HandicApp/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Actualizar coordenadas y mover el mapa
        onChange({
          ...value,
          direccion_calle: calle,
          direccion_numero: numero || value?.direccion_numero,
          latitud: lat,
          longitud: lng
        } as AddressData);
        
        setMapCenter([lat, lng]);
        setMapZoom(15);
      }
    } catch (error) {
      console.error('Error en geocodificación directa:', error);
    }
  }, [value, onChange]);

  // Buscar cuando cambia el query (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery);
      } else {
        setSearchResults([]);
        // Si se limpia la búsqueda, permitir editar todos los campos
        if (searchQuery === '') {
          setHasSelectedAddress(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress]);

  // Geocodificar cuando cambian calle y número (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo buscar si hay ciudad o provincia (para tener contexto)
      if (value?.direccion_calle && value.direccion_calle.length >= 3 && (value?.ciudad || value?.provincia)) {
        forwardGeocode(value.direccion_calle, value.direccion_numero);
      }
    }, 1000); // Debounce de 1 segundo para no hacer demasiadas peticiones

    return () => clearTimeout(timer);
  }, [value?.direccion_calle, value?.direccion_numero, value?.ciudad, value?.provincia, forwardGeocode]);

  // Resetear hasSelectedAddress si se limpian los campos de ubicación
  useEffect(() => {
    if (!value?.ciudad && !value?.provincia && !value?.pais) {
      setHasSelectedAddress(false);
    }
  }, [value?.ciudad, value?.provincia, value?.pais]);

  if (!mounted || !defaultIcon) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Dirección</Label>
          <Input
            placeholder="Cargando mapa..."
            disabled
            className="mt-1"
          />
        </div>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const markerPosition: [number, number] | null = 
    value?.latitud && value?.longitud 
      ? [value.latitud, value.longitud]
      : null;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address-input" className="text-sm font-medium text-gray-700">
          Buscar dirección *
        </Label>
        <div className="relative mt-1">
          <Input
            id="address-input"
            value={searchQuery || value?.direccion_calle || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe una dirección o haz clic en el mapa"
            className="pr-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto z-10">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">{result.display_name}</div>
                {result.address && (
                  <div className="text-xs text-gray-500 mt-1">
                    {[
                      result.address.city || result.address.town,
                      result.address.state || result.address.region
                    ].filter(Boolean).join(', ')}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          Escribe para buscar o haz clic en el mapa para marcar la ubicación
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600">Calle</Label>
            <Input
              value={value?.direccion_calle || ''}
              onChange={(e) => onChange({
                ...value,
                direccion_calle: e.target.value
              } as AddressData)}
              placeholder="Ingresa el nombre de la calle"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Número</Label>
            <Input
              value={value?.direccion_numero || ''}
              onChange={(e) => onChange({
                ...value,
                direccion_numero: e.target.value
              } as AddressData)}
              placeholder="Número"
              className="mt-1 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <Label className="text-xs text-gray-600">Ciudad</Label>
            <Input
              value={value?.ciudad || ''}
              onChange={(e) => onChange({
                ...value,
                ciudad: e.target.value
              } as AddressData)}
              readOnly={hasSelectedAddress}
              placeholder="Ciudad"
              className={`mt-1 text-sm ${hasSelectedAddress ? 'bg-gray-50' : ''}`}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Provincia</Label>
            <Input
              value={value?.provincia || ''}
              onChange={(e) => onChange({
                ...value,
                provincia: e.target.value
              } as AddressData)}
              readOnly={hasSelectedAddress}
              placeholder="Provincia"
              className={`mt-1 text-sm ${hasSelectedAddress ? 'bg-gray-50' : ''}`}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">País</Label>
            <Input
              value={value?.pais || ''}
              onChange={(e) => onChange({
                ...value,
                pais: e.target.value
              } as AddressData)}
              readOnly={hasSelectedAddress}
              placeholder="País"
              className={`mt-1 text-sm ${hasSelectedAddress ? 'bg-gray-50' : ''}`}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600">Código Postal</Label>
            <Input
              value={value?.codigo_postal || ''}
              onChange={(e) => onChange({
                ...value,
                codigo_postal: e.target.value
              } as AddressData)}
              placeholder="Código postal"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Coordenadas</Label>
            <Input
              value={value?.latitud && value?.longitud 
                ? `${value.latitud.toFixed(6)}, ${value.longitud.toFixed(6)}`
                : ''
              }
              readOnly
              className="mt-1 text-sm bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Mapa</Label>
        <div className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            key={`${mapCenter[0]}-${mapCenter[1]}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter as [number, number]} zoom={mapZoom} />
            <MapClickHandler onMapClick={handleMapClick} />
            {markerPosition && defaultIcon && (
              <DraggableMarker
                position={markerPosition}
                onDragEnd={handleMarkerDrag}
                icon={defaultIcon}
              />
            )}
          </MapContainer>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Haz clic en el mapa para marcar la ubicación o arrastra el marcador
        </p>
      </div>
    </div>
  );
};

