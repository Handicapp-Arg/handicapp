"use client";

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { eventoService, type Evento } from '@/lib/services/eventoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { EventoForm } from './EventoForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/utils/logger';

export function EventoList() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
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
      logger.error('Error loading eventos:', error);
      setEventos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvento = () => {
    setSelectedEvento(null);
    setShowForm(true);
  };

  const handleEditEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowForm(true);
  };

  const handleDeleteEvento = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await eventoService.delete(id);
        setEventos(eventos.filter(e => e.id !== id));
      } catch (error) {
        logger.error('Error deleting evento:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  const handleFormSuccess = async () => {
    await fetchEventos();
  };

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
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {canCreateEvents() && (
          <button 
            onClick={handleCreateEvento}
            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Evento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEventos.map((evento) => (
          <Card key={evento.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  evento.prioridad === 'critica' ? 'bg-red-100 text-red-800' :
                  evento.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                  evento.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {evento.prioridad}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {evento.descripcion && (
                <p className="text-sm text-gray-600 line-clamp-2">{evento.descripcion}</p>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fecha</span>
                  <span className="text-sm">{formatDate(evento.fecha_evento)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    evento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    evento.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                    evento.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {evento.estado}
                  </span>
                </div>
                {evento.caballo && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Caballo</span>
                    <span className="text-sm">{evento.caballo.nombre}</span>
                  </div>
                )}
                {evento.ubicacion && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ubicación</span>
                    <span className="text-sm">{evento.ubicacion}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {canCreateEvents() && (
                  <Button variant="secondary" size="sm" onClick={() => handleEditEvento(evento)} className="flex items-center gap-1">
                    <PencilIcon className="h-3 w-3" /> Editar
                  </Button>
                )}
                {canDeleteEvents() && (
                  <Button variant="secondary" size="sm" onClick={() => handleDeleteEvento(evento.id)} className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <TrashIcon className="h-3 w-3" /> Eliminar
                  </Button>
                )}
                {!canCreateEvents() && !canDeleteEvents() && (
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">Solo lectura</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state moderno */}
      {!loading && filteredEventos.length === 0 && (
        <div className="text-center py-16">
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
              <PlusIcon className="h-5 w-5 mr-2" />
              Crear Evento
            </button>
          )}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>Anterior</Button>
          <span className="flex items-center px-4 text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
          <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading}>Siguiente</Button>
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