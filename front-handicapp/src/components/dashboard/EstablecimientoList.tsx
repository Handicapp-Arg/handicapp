'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { establecimientoService, type Establecimiento, type EstablecimientoFilters } from '@/lib/services/stableService';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Home,
  Edit2,
} from 'lucide-react';

interface EstablecimientoListProps {
  showAll?: boolean;
  onViewDetails?: (establecimiento: Establecimiento) => void;
  onEdit?: (establecimiento: Establecimiento) => void;
  detailUrlPrefix?: string;
  /** Datos precargados desde el padre para evitar doble fetch */
  establecimientos?: Establecimiento[];
  /** Indica si los datos están cargando en el padre */
  isLoading?: boolean;
}

export function EstablecimientoList({
  showAll = false,
  onViewDetails,
  onEdit,
  detailUrlPrefix = '/propietario/stables',
  establecimientos: establecimientosProp,
  isLoading: isLoadingProp
}: EstablecimientoListProps) {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(establecimientosProp || []);
  const [loading, setLoading] = useState(establecimientosProp ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEstablecimientos, setFilteredEstablecimientos] = useState<Establecimiento[]>([]);
  const [filters, setFilters] = useState<EstablecimientoFilters>({
    page: 1,
    limit: 50,
    sortBy: 'nombre',
    sortOrder: 'ASC',
    tipo_establecimiento: undefined,
    estado: undefined
  });

  const handleFilterChange = (key: keyof EstablecimientoFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  useEffect(() => {
    if (establecimientosProp) {
      setEstablecimientos(establecimientosProp);
      setLoading(isLoadingProp || false);
    } else {
      loadEstablecimientos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, establecimientosProp, isLoadingProp]);

  useEffect(() => {
    if (Array.isArray(establecimientos)) {
      const establecimientosParaFiltrar = showAll
        ? establecimientos
        : establecimientos.filter(est =>
            est.mis_caballos && est.mis_caballos.length > 0
          );

      const filtered = establecimientosParaFiltrar.filter(est => {
        const matchSearch = searchTerm === '' ||
          est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (est.ciudad && est.ciudad.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (est.provincia && est.provincia.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchTipo = !filters.tipo_establecimiento ||
          est.tipo_establecimiento === filters.tipo_establecimiento;

        const matchEstado = !filters.estado ||
          est.estado === filters.estado;

        return matchSearch && matchTipo && matchEstado;
      });

      setFilteredEstablecimientos(filtered);
    } else {
      setFilteredEstablecimientos([]);
    }
  }, [searchTerm, establecimientos, filters.tipo_establecimiento, filters.estado, showAll]);

  const loadEstablecimientos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await establecimientoService.getAll({
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      let establecimientosArray: Establecimiento[] = [];

      if (Array.isArray(response)) {
        establecimientosArray = response;
      } else if (response && typeof response === 'object') {
        const r = response as { data?: unknown; items?: unknown; establecimientos?: unknown; [key: string]: unknown };
        establecimientosArray = (r.items ||
                                r.establecimientos ||
                                (r.data as { items?: unknown; establecimientos?: unknown })?.items ||
                                (r.data as { items?: unknown; establecimientos?: unknown })?.establecimientos ||
                                (Array.isArray(r.data) ? r.data : []) ||
                                []) as Establecimiento[];
      }

      setEstablecimientos(Array.isArray(establecimientosArray) ? establecimientosArray : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar establecimientos');
      setEstablecimientos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={loadEstablecimientos}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Búsqueda y filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white text-sm"
            />
          </div>

          <select
            value={filters.tipo_establecimiento || ''}
            onChange={(e) => handleFilterChange('tipo_establecimiento', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white text-sm sm:w-44"
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
            onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white text-sm sm:w-44"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          {filteredEstablecimientos.length} establecimiento{filteredEstablecimientos.length !== 1 ? 's' : ''} encontrado{filteredEstablecimientos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de establecimientos */}
      {filteredEstablecimientos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-md border border-gray-200">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-sm font-medium mb-1">
            {searchTerm ? 'No se encontraron establecimientos' : 'No hay establecimientos asociados'}
          </p>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega un nuevo establecimiento para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredEstablecimientos.map((establecimiento) => (
            <div
              key={establecimiento.id}
              className="border border-gray-200 rounded-md bg-white hover:bg-gray-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                  {establecimiento.nombre}
                </h3>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Caballos del usuario */}
                {establecimiento.mis_caballos && establecimiento.mis_caballos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">
                      Tus caballos ({establecimiento.mis_caballos.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {establecimiento.mis_caballos.map((caballo) => (
                        <Badge key={caballo.id} variant="outline" className="text-xs">
                          {caballo.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                    {establecimiento.tipo_establecimiento}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    establecimiento.estado === 'activo'
                      ? 'bg-green-50 text-green-700'
                      : establecimiento.estado === 'mantenimiento'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {establecimiento.estado}
                  </span>
                </div>

                {/* Stats */}
                {(establecimiento.superficie_hectareas || establecimiento.cantidad_boxes) && (
                  <div className="flex gap-4 text-xs text-gray-500">
                    {establecimiento.superficie_hectareas && (
                      <div className="flex items-center gap-1">
                        <Home className="h-3.5 w-3.5 text-gray-400" />
                        <span>{establecimiento.superficie_hectareas} ha</span>
                      </div>
                    )}
                    {establecimiento.cantidad_boxes && (
                      <div className="flex items-center gap-1">
                        <span>{establecimiento.cantidad_boxes} boxes</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Contacto y ubicación */}
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className={`line-clamp-1 ${!establecimiento.ciudad && !establecimiento.provincia ? 'text-gray-400 italic' : ''}`}>
                      {establecimiento.ciudad || establecimiento.provincia
                        ? [establecimiento.ciudad, establecimiento.provincia].filter(Boolean).join(', ')
                        : 'Sin ubicación'}
                    </span>
                  </div>

                  {establecimiento.telefono && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${establecimiento.telefono}`}
                        className="hover:text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {establecimiento.telefono}
                      </a>
                    </div>
                  )}

                  {establecimiento.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${establecimiento.email}`}
                        className="truncate hover:text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {establecimiento.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Administrador del establecimiento */}
                {establecimiento.usuarios && establecimiento.usuarios.length > 0 && (() => {
                  const admin = establecimiento.usuarios.find((u: any) => u.rol?.clave === 'establecimiento');
                  return admin ? (
                    <div className="border border-gray-100 rounded-md p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-semibold text-xs">
                            {admin.nombre?.[0]}{admin.apellido?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {admin.nombre} {admin.apellido}
                          </p>
                          <p className="text-xs text-gray-400">Administrador</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Acciones */}
                <div className="flex flex-col gap-2 mt-auto pt-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onViewDetails) {
                        onViewDetails(establecimiento);
                      } else {
                        window.location.href = `${detailUrlPrefix}/${establecimiento.id}`;
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                  >
                    Ver Detalles
                  </button>

                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(establecimiento);
                      }}
                      className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
