'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
// import { usePermissions } from '@/lib/hooks/usePermissions';
// import { useContextualData } from '@/lib/hooks/useContextualData';
import { establecimientoService, type Establecimiento, type EstablecimientoFilters } from '@/lib/services/establecimientoService';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  HomeIcon, 
  CalendarDaysIcon, 
  CheckIcon, 
  PencilIcon 
} from '@heroicons/react/24/outline';

interface EstablecimientoListProps {
  onSelectEstablecimiento?: (establecimiento: Establecimiento) => void;
  onCreateEstablecimiento?: () => void;
  onEditEstablecimiento?: (establecimiento: Establecimiento) => void;
}

export const EstablecimientoList: React.FC<EstablecimientoListProps> = ({
  onSelectEstablecimiento,
  onCreateEstablecimiento,
  onEditEstablecimiento
}) => {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EstablecimientoFilters>({
    page: 1,
    limit: 10,
    sortBy: 'nombre',
    sortOrder: 'ASC'
  });

  // Simplified permissions - assuming admin for now
  const canCreate = true;
  const canEdit = true;

  useEffect(() => {
    loadEstablecimientos();
  }, [filters]);

  const loadEstablecimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await establecimientoService.getAll(filters);
      
      setEstablecimientos(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar establecimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof EstablecimientoFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'haras': return '🐎';
      case 'polo': return '🥍';
      case 'salto': return '🏇';
      case 'doma': return '🎯';
      case 'turf': return '🏁';
      case 'mixto': return '🏢';
      default: return '🏢';
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activo: 'bg-green-100 text-green-800',
      inactivo: 'bg-gray-100 text-gray-800',
      mantenimiento: 'bg-yellow-100 text-yellow-800'
    };
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando establecimientos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar establecimientos</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadEstablecimientos}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header moderno */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Establecimientos</h2>
          <p className="text-gray-600">Gestiona los establecimientos ecuestres</p>
        </div>

        <SimpleAdminOnly>
          <button 
            onClick={onCreateEstablecimiento}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Establecimiento
          </button>
        </SimpleAdminOnly>
      </div>

      {/* Filtros modernos */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar establecimientos..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.tipo_establecimiento || ''}
          onChange={(e) => handleFilterChange('tipo_establecimiento', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Todos los tipos</option>
          <option value="haras">Haras</option>
          <option value="polo">Polo</option>
          <option value="salto">Salto</option>
          <option value="doma">Doma</option>
          <option value="turf">Turf</option>
          <option value="mixto">Mixto</option>
        </select>

        <select
          value={filters.estado || ''}
          onChange={(e) => handleFilterChange('estado', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      {/* Grid de establecimientos moderno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {establecimientos.map((establecimiento) => (
          <div key={establecimiento.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-gray-200">
            <div className="p-6">
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{getTipoIcon(establecimiento.tipo_establecimiento)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{establecimiento.nombre}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadge(establecimiento.estado)}`}>
                      {establecimiento.estado}
                    </span>
                  </div>
                </div>
                
                <SimpleAdminOnly>
                  <button
                    onClick={() => onEditEstablecimiento?.(establecimiento)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </SimpleAdminOnly>
              </div>

              {/* Información básica */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{establecimiento.direccion}</span>
                </div>
                
                {establecimiento.telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{establecimiento.telefono}</span>
                  </div>
                )}
                
                {establecimiento.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{establecimiento.email}</span>
                  </div>
                )}
              </div>

              {/* Estadísticas en grid */}
              {establecimiento._count && (
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                      <UserGroupIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{establecimiento._count.usuarios}</div>
                      <div className="text-xs text-gray-500">usuarios</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                      <HomeIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{establecimiento._count.caballos}</div>
                      <div className="text-xs text-gray-500">caballos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                      <CalendarDaysIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{establecimiento._count.eventos}</div>
                      <div className="text-xs text-gray-500">eventos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                      <CheckIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{establecimiento._count.tareas}</div>
                      <div className="text-xs text-gray-500">tareas</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              {(establecimiento.superficie_hectareas || establecimiento.cantidad_boxes) && (
                <div className="flex justify-between text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                  {establecimiento.superficie_hectareas && (
                    <div>
                      <span className="font-medium">Superficie:</span> {establecimiento.superficie_hectareas} ha
                    </div>
                  )}
                  {establecimiento.cantidad_boxes && (
                    <div>
                      <span className="font-medium">Boxes:</span> {establecimiento.cantidad_boxes}
                    </div>
                  )}
                </div>
              )}

              {/* Botón de acción */}
              <button
                onClick={() => onSelectEstablecimiento?.(establecimiento)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State moderno */}
      {establecimientos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay establecimientos
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comienza creando tu primer establecimiento ecuestre
          </p>
          <SimpleAdminOnly>
            <button 
              onClick={onCreateEstablecimiento}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Crear Establecimiento
            </button>
          </SimpleAdminOnly>
        </div>
      )}
    </div>
  );
};