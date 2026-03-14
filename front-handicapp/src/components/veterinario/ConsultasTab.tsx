/**
 * 🩺 CONSULTAS TAB
 * Gestión de consultas médicas veterinarias
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useEventos } from '@/lib/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Calendar,
  Plus,
  Eye
} from 'lucide-react';
import { Evento } from '@/lib/types';
import Link from 'next/link';

export default function ConsultasTab() {
  const { data: eventos = [], isLoading } = useEventos({ page: 1, limit: 500 });
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');

  // Procesar consultas
  const consultas = useMemo(() => {
    const eventosArray = Array.isArray(eventos) ? eventos : [];
    
    return eventosArray.filter((e: Evento) => 
      e.tipo_evento?.nombre?.toLowerCase().includes('consulta') ||
      e.tipo_evento?.categoria?.toLowerCase().includes('veterinaria')
    );
  }, [eventos]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: consultas.length,
    pendientes: consultas.filter((c: Evento) => c.estado === 'pendiente').length,
    completadas: consultas.filter((c: Evento) => c.estado === 'completado').length,
    urgentes: consultas.filter((c: Evento) => 
      c.prioridad === 'alta' || c.prioridad === 'critica'
    ).length,
  }), [consultas]);

  // Filtrado
  const consultasFiltradas = consultas.filter((c: Evento) => {
    const matchesSearch = c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFiltro === 'todos' || c.estado === estadoFiltro;
    return matchesSearch && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Cargando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendientes}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Completadas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.completadas}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Urgentes</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.urgentes}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar consultas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completadas</option>
            <option value="cancelado">Canceladas</option>
          </select>

          <Link href="/veterinario/consultas/crear">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Consulta
            </Button>
          </Link>
        </div>
      </div>

      {/* Consultas List */}
      {consultasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No hay consultas
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || estadoFiltro !== 'todos'
                ? 'No se encontraron resultados con los filtros aplicados'
                : 'Comienza registrando tu primera consulta médica'
              }
            </p>
            {!searchTerm && estadoFiltro === 'todos' && (
              <Link href="/veterinario/consultas/crear">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Consulta
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {consultasFiltradas.map((consulta: Evento) => (
            <Card key={consulta.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {consulta.titulo}
                      </h3>
                      <Badge
                        variant={
                          consulta.estado === 'completado' ? 'default' :
                          consulta.estado === 'pendiente' ? 'secondary' :
                          'outline'
                        }
                      >
                        {consulta.estado}
                      </Badge>
                      {(consulta.prioridad === 'alta' || consulta.prioridad === 'critica') && (
                        <Badge variant="destructive">Urgente</Badge>
                      )}
                    </div>
                    
                    {consulta.descripcion && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {consulta.descripcion}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(consulta.fecha_evento).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      {consulta.hora_inicio && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{consulta.hora_inicio}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
