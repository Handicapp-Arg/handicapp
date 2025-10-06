"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { eventoService, type Evento } from '@/lib/services/eventoService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function EventoList() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        <h2 className="text-2xl font-bold">Eventos</h2>
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
            <div key={evento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{evento.titulo}</h3>
                  {evento.descripcion && (
                    <p className="text-sm text-gray-600">{evento.descripcion}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fecha:</span> {formatDate(evento.fecha_evento)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Estado:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      evento.estado === 'completado' ? 'bg-green-100 text-green-800' :
                      evento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {evento.estado}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}