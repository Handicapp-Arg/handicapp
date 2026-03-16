'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Grid3x3,
  List,
  Sparkles,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  estado: string;
  prioridad: string;
  originado_de_tarea_id?: number;
  tipo_evento?: {
    nombre: string;
    color?: string;
  };
  caballo?: {
    nombre: string;
  };
}

interface CalendarioEventosProps {
  eventos: Evento[];
  onCreateEvento?: () => void;
  onEventoClick?: (evento: Evento) => void;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function CalendarioEventos({ eventos = [], onCreateEvento, onEventoClick }: CalendarioEventosProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'programados' | 'completados' | 'auto'>('todos');

  const eventosArray = useMemo(() => {
    return Array.isArray(eventos) ? eventos : [];
  }, [eventos]);

  // Navegación de mes
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generar días del calendario
  const diasDelMes = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dias: Array<{ fecha: Date; esDelMes: boolean; eventos: Evento[] }> = [];
    
    // Días del mes anterior para completar la primera semana
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const fecha = new Date(year, month, -i);
      dias.push({ fecha, esDelMes: false, eventos: [] });
    }
    
    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const fecha = new Date(year, month, i);
      const eventosDelDia = eventosArray.filter(e => {
        const fechaEvento = new Date(e.fecha_evento);
        return fechaEvento.getDate() === i && 
               fechaEvento.getMonth() === month && 
               fechaEvento.getFullYear() === year;
      });
      dias.push({ fecha, esDelMes: true, eventos: eventosDelDia });
    }
    
    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - dias.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      const fecha = new Date(year, month + 1, i);
      dias.push({ fecha, esDelMes: false, eventos: [] });
    }
    
    return dias;
  }, [currentDate, eventosArray]);

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    let filtered = eventosArray;
    
    if (selectedFilter === 'programados') {
      filtered = filtered.filter(e => e.estado !== 'completado' && e.estado !== 'cancelado');
    } else if (selectedFilter === 'completados') {
      filtered = filtered.filter(e => e.estado === 'completado');
    } else if (selectedFilter === 'auto') {
      filtered = filtered.filter(e => e.originado_de_tarea_id);
    }
    
    return filtered.sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime());
  }, [eventosArray, selectedFilter]);

  const getEventColor = (evento: Evento) => {
    if (evento.originado_de_tarea_id) return 'bg-purple-100 border-purple-300 text-purple-700';
    if (evento.estado === 'completado') return 'bg-green-100 border-green-300 text-green-700';
    if (evento.estado === 'cancelado') return 'bg-gray-100 border-gray-300 text-gray-600';
    if (evento.prioridad === 'alta' || evento.prioridad === 'critica') return 'bg-red-100 border-red-300 text-red-700';
    return 'bg-gray-100 border-gray-300 text-gray-700';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (fecha: Date) => {
    const today = new Date();
    return fecha.getDate() === today.getDate() &&
           fecha.getMonth() === today.getMonth() &&
           fecha.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Navegación de mes */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center min-w-[200px]">
            <h2 className="text-xl font-bold text-gray-900">
              {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Hoy
          </button>
        </div>

        {/* Controles de vista y filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtros */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setSelectedFilter('todos')}
              className={`px-3 py-2 text-xs font-medium rounded-md ${
                selectedFilter === 'todos' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('programados')}
              className={`px-3 py-2 text-xs font-medium rounded-md ${
                selectedFilter === 'programados' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Programados
            </button>
            <button
              onClick={() => setSelectedFilter('completados')}
              className={`px-3 py-2 text-xs font-medium rounded-md ${
                selectedFilter === 'completados' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completados
            </button>
            <button
              onClick={() => setSelectedFilter('auto')}
              className={`px-3 py-2 text-xs font-medium rounded-md flex items-center gap-1 ${
                selectedFilter === 'auto' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Auto
            </button>
          </div>

          {/* Toggle vista — calendar only available on sm+ */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2.5 rounded-md ${
                viewMode === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-md ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Botón crear */}
          {onCreateEvento && (
            <button
              onClick={onCreateEvento}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Evento
            </button>
          )}
        </div>
      </div>

      {/* Vista de calendario o lista */}
      {viewMode === 'calendar' ? (
        <div className="hidden sm:block bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
          {/* Header días de la semana */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className="p-3 text-center text-sm font-semibold text-gray-700">
                {dia}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7">
            {diasDelMes.map((dia, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                  !dia.esDelMes ? 'bg-gray-50/50' : 'bg-white'
                } ${isToday(dia.fecha) ? 'bg-gray-50 ring-2 ring-gray-900 ring-inset' : ''} hover:bg-gray-50`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  !dia.esDelMes ? 'text-gray-400' : 
                  isToday(dia.fecha) ? 'text-gray-900 font-bold' : 'text-gray-700'
                }`}>
                  {dia.fecha.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dia.eventos.slice(0, 3).map(evento => (
                    <button
                      key={evento.id}
                      onClick={() => onEventoClick?.(evento)}
                      className={`w-full text-left px-2 py-1 rounded text-xs border ${getEventColor(evento)}`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        {evento.originado_de_tarea_id && (
                          <Sparkles className="w-3 h-3 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">{evento.titulo}</span>
                      </div>
                      <div className="text-[10px] opacity-75 truncate">
                        {formatTime(evento.fecha_evento)}
                      </div>
                    </button>
                  ))}
                  {dia.eventos.length > 3 && (
                    <div className="text-[10px] text-gray-500 font-medium px-2">
                      +{dia.eventos.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Vista de lista
        <div className="space-y-3">
          {eventosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-md border border-gray-200">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h3>
              <p className="text-gray-600 mb-6">
                {selectedFilter !== 'todos' 
                  ? 'No se encontraron eventos con el filtro seleccionado' 
                  : 'Comienza creando tu primer evento'}
              </p>
              {onCreateEvento && selectedFilter === 'todos' && (
                <button
                  onClick={onCreateEvento}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Crear Evento
                </button>
              )}
            </div>
          ) : (
            eventosFiltrados.map(evento => (
              <button
                key={evento.id}
                onClick={() => onEventoClick?.(evento)}
                className="w-full text-left bg-white rounded-md border border-gray-200 p-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Fecha */}
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 rounded-md bg-gray-100 flex flex-col items-center justify-center">
                      <div className="text-xs font-medium text-gray-600 uppercase">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-ES', { month: 'short' })}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(evento.fecha_evento).getDate()}
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                        {evento.titulo}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {evento.originado_de_tarea_id && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                        <Badge variant="secondary" className={
                          evento.estado === 'completado' ? 'bg-green-100 text-green-700' :
                          evento.estado === 'cancelado' ? 'bg-gray-100 text-gray-700' :
                          'bg-amber-50 text-amber-700'
                        }>
                          {evento.estado === 'completado' ? 'Completado' : 
                           evento.estado === 'cancelado' ? 'Cancelado' : 'Programado'}
                        </Badge>
                      </div>
                    </div>

                    {evento.descripcion && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {evento.descripcion}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(evento.fecha_evento)}
                      </div>
                      {evento.caballo && (
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                          {evento.caballo.nombre}
                        </div>
                      )}
                      {evento.tipo_evento && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          {evento.tipo_evento.nombre}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
