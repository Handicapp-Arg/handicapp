'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { establecimientoService, type Establecimiento, type EstablecimientoFilters } from '@/lib/services/establecimientoService';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  CheckCircle2,
} from 'lucide-react';

export function EstablecimientoList() {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadEstablecimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    // Asegurar que establecimientos es un array antes de filtrar
    if (Array.isArray(establecimientos)) {
      const filtered = establecimientos.filter(est => {
        const matchSearch = searchTerm === '' || 
          est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          est.direccion.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchTipo = !filters.tipo_establecimiento || 
          est.tipo_establecimiento === filters.tipo_establecimiento;
        
        const matchEstado = !filters.estado || 
          est.estado === filters.estado;
        
        return matchSearch && matchTipo && matchEstado;
      });
      
      // Ordenar: primero los que tienen caballos del usuario
      const sorted = filtered.sort((a, b) => {
        const aHasCaballos = (a.mis_caballos?.length || 0) > 0;
        const bHasCaballos = (b.mis_caballos?.length || 0) > 0;
        
        if (aHasCaballos && !bHasCaballos) return -1;
        if (!aHasCaballos && bHasCaballos) return 1;
        return 0;
      });
      
      setFilteredEstablecimientos(sorted);
    } else {
      setFilteredEstablecimientos([]);
    }
  }, [searchTerm, establecimientos, filters.tipo_establecimiento, filters.estado]);

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
      
      console.log('📦 Establecimientos cargados:', establecimientosArray);
      setEstablecimientos(Array.isArray(establecimientosArray) ? establecimientosArray : []);
    } catch (err) {
      console.error('❌ Error cargando establecimientos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar establecimientos');
      setEstablecimientos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando establecimientos...</p>
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

  return (
    <div className="space-y-6">
      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        {/* Búsqueda y filtros en una fila */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <select
            value={filters.tipo_establecimiento || ''}
            onChange={(e) => handleFilterChange('tipo_establecimiento', e.target.value || undefined)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white sm:w-48"
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
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white sm:w-48"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        {/* Contador */}
        <div className="text-sm text-gray-600">
          {filteredEstablecimientos.length} establecimiento{filteredEstablecimientos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de establecimientos */}
      {filteredEstablecimientos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchTerm ? 'No se encontraron establecimientos' : 'No hay establecimientos asociados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEstablecimientos.map((establecimiento) => (
            <div 
              key={establecimiento.id}
              className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Header más sutil */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {establecimiento.nombre}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">{establecimiento.direccion}</span>
                    </div>
                  </div>
                  {establecimiento.estado === 'activo' && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 space-y-3">
                {/* Caballos del usuario - más profesional */}
                {establecimiento.mis_caballos && establecimiento.mis_caballos.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-emerald-900">
                        Tus caballos aquí ({establecimiento.mis_caballos.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {establecimiento.mis_caballos.map((caballo) => (
                        <Badge key={caballo.id} variant="outline" className="bg-white border-emerald-300 text-emerald-700 text-xs">
                          {caballo.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="capitalize text-xs bg-gray-100 text-gray-700 border-0">
                    {establecimiento.tipo_establecimiento}
                  </Badge>
                  <Badge 
                    className={`text-xs border-0 ${
                      establecimiento.estado === 'activo' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {establecimiento.estado}
                  </Badge>
                </div>

                {/* Stats - sin emojis */}
                {(establecimiento.superficie_hectareas || establecimiento.cantidad_boxes) && (
                  <div className="flex gap-4 text-xs text-gray-600 py-2">
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
                {(establecimiento.telefono || establecimiento.email) && (
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
                  onClick={() => {
                    window.location.href = `/propietario/establecimientos/${establecimiento.id}`;
                  }}
                  className="w-full mt-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
