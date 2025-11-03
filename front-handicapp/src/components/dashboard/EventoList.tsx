"use client";

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { eventoService, type Evento } from '@/lib/services/eventoService';
import { EventoForm } from './EventoForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar,
  FileText,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

export function EventoList() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthNew();
  const { canCreateEvents, canDeleteEvents, getUserRole } = usePermissions();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchEventos();
    }
  }, [currentPage, searchTerm, authLoading, isAuthenticated]);

  const fetchEventos = async () => {
    if (authLoading || !isAuthenticated) return;
    try {
      setLoading(true);
      const response: any = await eventoService.getAll({ page: currentPage, limit: 10, search: searchTerm });
      const eventosData = response?.data?.eventos || response?.eventos || response?.data || response || [];
      const list: Evento[] = Array.isArray(eventosData) ? eventosData : [];
      const totalPagesData = response?.meta?.totalPages || response?.data?.totalPages || response?.totalPages || 1;
      setEventos(list);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Error loading eventos:', error);
      setEventos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvento = () => {
    setSelectedEventoId(null);
    setShowForm(true);
  };

  const handleEditEvento = (evento: Evento) => {
    setSelectedEventoId(evento.id);
    setShowForm(true);
  };

  const handleDeleteEvento = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await eventoService.delete(id);
        setEventos(eventos.filter(e => e.id !== id));
      } catch (error) {
        console.error('Error deleting evento:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setSelectedEventoId(null);
    await fetchEventos();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEventoId(null);
  };

  // Obtener el evento seleccionado de la lista actualizada
  const selectedEvento = selectedEventoId 
    ? eventos.find(e => e.id === selectedEventoId) || null
    : null;

  const filteredEventos = eventos.filter(evento =>
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (evento.descripcion && evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && eventos.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Buscador + Acción */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {canCreateEvents() && (
          <button 
            onClick={handleCreateEvento}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-semibold whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Evento
          </button>
        )}
      </div>

      <div className="max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.length === 0 ? (
            <div className="text-center py-16 w-full col-span-full">
              <div className="text-6xl mb-6">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay eventos</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm ? 'No se encontraron eventos que coincidan con tu búsqueda.' : 'Crea tu primer evento para comenzar.'}
              </p>
              {!searchTerm && canCreateEvents() && (
                <button 
                  onClick={handleCreateEvento}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Evento
                </button>
              )}
            </div>
          ) : (
            filteredEventos.map((evento) => (
              <div 
                key={evento.id} 
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
              >
                {/* Barra de color según prioridad */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  evento.prioridad === 'critica' || evento.prioridad === 'alta'
                    ? 'bg-red-500' 
                    : evento.prioridad === 'media'
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}></div>

                {/* Header con título y badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{evento.titulo}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        evento.estado === 'completado' ? 'bg-green-100 text-green-800' :
                        evento.estado === 'en_progreso' || evento.estado === 'programado' ? 'bg-blue-100 text-blue-800' :
                        evento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        evento.estado === 'cancelado' || evento.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {evento.estado === 'en_progreso' ? 'En Progreso' : 
                         evento.estado === 'completado' ? 'Completado' :
                         evento.estado === 'pendiente' ? 'Pendiente' :
                         evento.estado === 'programado' ? 'Programado' :
                         evento.estado === 'cancelado' ? 'Cancelado' :
                         evento.estado === 'vencido' ? 'Vencido' :
                         evento.estado === 'reprogramado' ? 'Reprogramado' : evento.estado}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        evento.prioridad === 'critica' ? 'bg-red-100 text-red-800' :
                        evento.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                        evento.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {evento.prioridad === 'critica' ? 'Crítica' : 
                         evento.prioridad === 'alta' ? 'Alta' :
                         evento.prioridad === 'media' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canCreateEvents() && (
                      <button 
                        onClick={() => handleEditEvento(evento)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {canDeleteEvents() && (
                      <button 
                        onClick={() => handleDeleteEvento(evento.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Descripción */}
                {evento.descripcion && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{evento.descripcion}</p>
                )}
                
                {/* Grid de información */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium mr-1">Fecha:</span> 
                    <span>{formatDate(evento.fecha_evento)}</span>
                  </div>
                  
                  {evento.tipo_evento && (
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium mr-1">Tipo:</span> 
                      <span className="capitalize">{evento.tipo_evento.nombre}</span>
                    </div>
                  )}
                  
                  {evento.caballo && (
                    <div className="flex items-center text-gray-600">
                      <Sparkles className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium mr-1">Caballo:</span> 
                      <span className="truncate">{evento.caballo.nombre}</span>
                    </div>
                  )}
                  
                  {evento.ubicacion && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium mr-1">Ubicación:</span> 
                      <span className="truncate">{evento.ubicacion}</span>
                    </div>
                  )}
                  
                  {(evento.hora_inicio || evento.hora_fin) && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium mr-1">Horario:</span> 
                      <span>
                        {evento.hora_inicio && evento.hora_fin 
                          ? `${evento.hora_inicio} - ${evento.hora_fin}`
                          : evento.hora_inicio || evento.hora_fin}
                      </span>
                    </div>
                  )}
                </div>

                {/* Indicador de solo lectura */}
                {!canCreateEvents() && !canDeleteEvents() && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Solo lectura
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1 || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
      
      <EventoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        evento={selectedEvento}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}