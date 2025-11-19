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
  Edit2,
  Loader2,
} from 'lucide-react';

interface EstablecimientoListProps {
  showAll?: boolean; // Si es true, muestra todos los establecimientos sin filtrar por mis_caballos
  onViewDetails?: (establecimiento: Establecimiento) => void; // Callback opcional para manejar el click en "Ver Detalles"
  onEdit?: (establecimiento: Establecimiento) => void; // Callback opcional para manejar la edición
  detailUrlPrefix?: string; // Prefijo de URL para el detalle (por defecto '/propietario/establecimientos')
}

export function EstablecimientoList({ 
  showAll = false, 
  onViewDetails,
  onEdit,
  detailUrlPrefix = '/propietario/establecimientos'
}: EstablecimientoListProps) {
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
      // Si showAll es true (página de admin), mostrar todos los establecimientos
      // Si showAll es false (página de propietario), solo mostrar donde el usuario tiene caballos
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
      
      // Manejar diferentes estructuras de respuesta
      // El servicio ya extrae response.data, así que response es { items: [...], pagination: {...} }
      let establecimientosArray: Establecimiento[] = [];
      
      if (Array.isArray(response)) {
        establecimientosArray = response;
      } else if (response && typeof response === 'object') {
        const r = response as { data?: unknown; items?: unknown; establecimientos?: unknown; [key: string]: unknown };
        // El servicio devuelve response.data que es { items: [...], pagination: {...} }
        // Entonces buscamos directamente items o establecimientos
        establecimientosArray = (r.items || 
                                r.establecimientos || 
                                (r.data as { items?: unknown; establecimientos?: unknown })?.items ||
                                (r.data as { items?: unknown; establecimientos?: unknown })?.establecimientos ||
                                (Array.isArray(r.data) ? r.data : []) || 
                                []) as Establecimiento[];
      }
      
      console.log('📦 Establecimientos cargados:', {
        count: establecimientosArray.length,
        establecimientos: establecimientosArray,
        response: response
      });
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
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Cargando establecimientos...</p>
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
    <div className="p-6 space-y-6">
      {/* Búsqueda y filtros */}
      <div className="space-y-4">
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
        <div className="text-sm font-medium text-slate-600">
          {filteredEstablecimientos.length} establecimiento{filteredEstablecimientos.length !== 1 ? 's' : ''} encontrado{filteredEstablecimientos.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de establecimientos */}
      {filteredEstablecimientos.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
          <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-base font-medium mb-1">
            {searchTerm ? 'No se encontraron establecimientos' : 'No hay establecimientos asociados'}
          </p>
          <p className="text-slate-500 text-sm">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega un nuevo establecimiento para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredEstablecimientos.map((establecimiento) => (
            <div 
              key={establecimiento.id}
              className="group bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col h-full"
            >
              {/* Header más sutil */}
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <h4 className="font-bold text-base text-slate-900 group-hover:text-[#0f172a] transition-colors line-clamp-2">
                  {establecimiento.nombre}
                </h4>
              </div>

              {/* Contenido */}
              <div className="p-5 flex flex-col h-full">
                <div className="space-y-4 flex-1">
                  {/* Caballos del usuario - más profesional */}
                  {establecimiento.mis_caballos && establecimiento.mis_caballos.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-900">
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
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="capitalize text-xs bg-slate-100 text-slate-700 border-0 font-medium">
                      {establecimiento.tipo_establecimiento}
                    </Badge>
                    <Badge 
                      className={`text-xs border-0 font-medium ${
                        establecimiento.estado === 'activo' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {establecimiento.estado}
                    </Badge>
                  </div>

                  {/* Stats - sin emojis */}
                  {(establecimiento.superficie_hectareas || establecimiento.cantidad_boxes) && (
                    <div className="flex gap-5 text-xs text-slate-600 py-2.5">
                      {establecimiento.superficie_hectareas && (
                        <div className="flex items-center gap-1.5">
                          <Home className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold">{establecimiento.superficie_hectareas}</span>
                          <span className="text-slate-500">ha</span>
                        </div>
                      )}
                      {establecimiento.cantidad_boxes && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-4 w-4 text-slate-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="10" rx="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                          <span className="font-semibold">{establecimiento.cantidad_boxes}</span>
                          <span className="text-slate-500">boxes</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contacto y ubicación */}
                  <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    {/* Ubicación - siempre visible */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className={`line-clamp-1 ${!establecimiento.ciudad && !establecimiento.provincia ? 'text-slate-400 italic' : ''}`}>
                        {establecimiento.ciudad || establecimiento.provincia 
                          ? [establecimiento.ciudad, establecimiento.provincia].filter(Boolean).join(', ')
                          : 'Sin ubicación'}
                      </span>
                    </div>
                    
                    {establecimiento.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <a 
                          href={`tel:${establecimiento.telefono}`}
                          className="hover:text-[#0f172a] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {establecimiento.telefono}
                        </a>
                      </div>
                    )}
                    
                    {establecimiento.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <a 
                          href={`mailto:${establecimiento.email}`}
                          className="truncate hover:text-[#0f172a] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {establecimiento.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔍 Click en Ver Detalles:', { 
                      tieneCallback: !!onViewDetails, 
                      establecimientoId: establecimiento.id,
                      detailUrlPrefix 
                    });
                    if (onViewDetails) {
                      console.log('✅ Usando callback onViewDetails');
                      onViewDetails(establecimiento);
                    } else {
                      console.log('⚠️ No hay callback, redirigiendo a:', `${detailUrlPrefix}/${establecimiento.id}`);
                      window.location.href = `${detailUrlPrefix}/${establecimiento.id}`;
                    }
                  }}
<<<<<<< HEAD
                  className="w-full mt-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
=======
                  className="w-full mt-4 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
>>>>>>> 6c039e0719c6c03c5e80cdae7fe0a6bea580794f
                >
                  Ver Detalles
                </button>

                {/* Botón de editar - solo visible si hay callback onEdit */}
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(establecimiento);
                    }}
                    className="w-full mt-2 px-4 py-2.5 bg-white border-2 border-slate-900 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
