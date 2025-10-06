"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { tareaService, type Tarea } from '@/lib/services/tareaService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TareaForm } from './TareaForm';
import { PlusIcon, DocumentTextIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

export function TareaList() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
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

  const handleCreateTarea = () => {
    setSelectedTarea(null);
    setShowForm(true);
  };

  const handleEditTarea = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setShowForm(true);
  };

  const handleDeleteTarea = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await tareaService.delete(id);
        setTareas(tareas.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting tarea:', error);
        alert('Error al eliminar la tarea');
      }
    }
  };

  const handleCompleteTask = async (tarea: Tarea) => {
    try {
      // Crear objeto con propiedades que coincidan con CreateTareaData
      const updateData = {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        tipo: tarea.tipo as any, // Se necesita cast porque los tipos pueden diferir
        prioridad: tarea.prioridad as any
      };
      await tareaService.update(tarea.id, updateData);
      setTareas(tareas.map(t => t.id === tarea.id ? { ...t, estado: 'completada' } : t));
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Error al completar la tarea');
    }
  };

  const handleFormSuccess = async () => {
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
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Tareas</h2>
        </div>
        <Button onClick={handleCreateTarea} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Nueva Tarea
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
        {filteredTareas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron tareas
          </div>
        ) : (
          filteredTareas.map((tarea) => (
            <div key={tarea.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{tarea.titulo}</h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tarea.estado)}`}>
                        {tarea.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {tarea.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-2">{tarea.descripcion}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">📋 Tipo:</span> {tarea.tipo}
                    </p>
                    {tarea.fecha_vencimiento && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">⏰ Vencimiento:</span> {formatDate(tarea.fecha_vencimiento)}
                      </p>
                    )}
                    {tarea.asignado_a && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">👤 Asignado a:</span> {tarea.asignado_a.nombre} {tarea.asignado_a.apellido}
                      </p>
                    )}
                    {tarea.caballo && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">🐎 Caballo:</span> {tarea.caballo.nombre}
                      </p>
                    )}
                    {tarea.ubicacion && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📍 Ubicación:</span> {tarea.ubicacion}
                      </p>
                    )}
                    {tarea.tiempo_estimado_minutos && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">⏱️ Tiempo estimado:</span> {tarea.tiempo_estimado_minutos} min
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {tarea.estado !== 'completada' && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleCompleteTask(tarea)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700"
                    >
                      <CheckIcon className="h-3 w-3" />
                      Completar
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleEditTarea(tarea)}
                    className="flex items-center gap-1"
                  >
                    <PencilIcon className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleDeleteTarea(tarea.id)}
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
      
      <TareaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        tarea={selectedTarea}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}