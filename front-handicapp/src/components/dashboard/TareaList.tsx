"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { tareaService, type Tarea } from '@/lib/services/tareaService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TareaList() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        setLoading(true);
        const response = await tareaService.getAll();
        setTareas(response.data || response);
      } catch (error) {
        console.error('Error loading tareas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTareas();
  }, []);

  const filteredTareas = tareas.filter(tarea =>
    tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando tareas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tareas</h2>
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
        {filteredTareas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron tareas
          </div>
        ) : (
          filteredTareas.map((tarea) => (
            <div key={tarea.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
                  {tarea.descripcion && (
                    <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                  )}
                  {tarea.fecha_vencimiento && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Vencimiento:</span> {formatDate(tarea.fecha_vencimiento)}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(tarea.prioridad)}`}>
                      {tarea.prioridad}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tarea.estado)}`}>
                      {tarea.estado.replace('_', ' ')}
                    </span>
                  </div>
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