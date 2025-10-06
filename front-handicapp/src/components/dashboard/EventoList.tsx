"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { eventoService, type Evento } from '@/lib/services/eventoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventoForm } from './EventoForm';
import { PlusIcon, CalendarDaysIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function EventoList() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const response = await eventoService.getAll();
        setEventos(response.data || response);
      } catch (error) {
        console.error('Error loading eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

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
        console.error('Error deleting evento:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  const handleFormSuccess = async () => {
    try {
      setLoading(true);
      const response = await eventoService.getAll();
      setEventos(response.data || response);
    } catch (error) {
      console.error('Error loading eventos:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <div className="flex justify-center p-8">Cargando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Eventos</h2>
        </div>
        <Button onClick={handleCreateEvento} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>
      
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por título o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredEventos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron eventos
          </div>
        ) : (
          filteredEventos.map((evento) => (
            <div key={evento.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{evento.titulo}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      evento.prioridad === 'critica' ? 'bg-red-100 text-red-800' :
                      evento.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                      evento.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {evento.prioridad}
                    </span>
                  </div>
                  
                  {evento.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-2">{evento.descripcion}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">📅 Fecha:</span> {formatDate(evento.fecha_evento)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">📍 Estado:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        evento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        evento.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        evento.estado === 'vencido' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {evento.estado}
                      </span>
                    </p>
                    {evento.caballo && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">🐎 Caballo:</span> {evento.caballo.nombre}
                      </p>
                    )}
                    {evento.ubicacion && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📍 Ubicación:</span> {evento.ubicacion}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleEditEvento(evento)}
                    className="flex items-center gap-1"
                  >
                    <PencilIcon className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleDeleteEvento(evento.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-3 w-3" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <EventoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        evento={selectedEvento}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}