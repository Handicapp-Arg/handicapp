'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadEstablecimientos} className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Establecimientos</h2>
          <p className="text-gray-600">Gestiona los establecimientos ecuestres</p>
        </div>

        <SimpleAdminOnly>
          <Button 
            onClick={onCreateEstablecimiento}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Establecimiento
          </Button>
        </SimpleAdminOnly>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar establecimientos..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filters.tipo_establecimiento || ''}
          onChange={(e) => handleFilterChange('tipo_establecimiento', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      {/* Lista de Establecimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {establecimientos.map((establecimiento) => (
          <Card key={establecimiento.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTipoIcon(establecimiento.tipo_establecimiento)}</span>
                  <div>
                    <CardTitle className="text-lg">{establecimiento.nombre}</CardTitle>
                    <Badge className={getEstadoBadge(establecimiento.estado)}>
                      {establecimiento.estado}
                    </Badge>
                  </div>
                </div>
                
                <SimpleAdminOnly>
                  <Button
                    variant="ghost"
                    onClick={() => onEditEstablecimiento?.(establecimiento)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </SimpleAdminOnly>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Información básica */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                  {establecimiento.direccion}
                </div>
                
                {establecimiento.telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                    {establecimiento.telefono}
                  </div>
                )}
                
                {establecimiento.email && (
                  <div className="flex items-center text-sm text-gray-600">
                                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    {establecimiento.email}
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              {establecimiento._count && (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="flex items-center text-sm">
                    <UserGroupIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{establecimiento._count.usuarios} usuarios</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <HomeIcon className="h-4 w-4 mr-2 text-green-500" />
                    <span>{establecimiento._count.caballos} caballos</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{establecimiento._count.eventos} eventos</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 mr-2 text-orange-500" />
                    <span>{establecimiento._count.tareas} tareas</span>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              {(establecimiento.superficie_hectareas || establecimiento.cantidad_boxes) && (
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
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
                </div>
              )}

              {/* Acción principal */}
              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={() => onSelectEstablecimiento?.(establecimiento)}
              >
                Ver Detalles
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {establecimientos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay establecimientos
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza creando tu primer establecimiento ecuestre
          </p>
          <SimpleAdminOnly>
            <Button 
              onClick={onCreateEstablecimiento}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Crear Establecimiento
            </Button>
          </SimpleAdminOnly>
        </div>
      )}
    </div>
  );
};