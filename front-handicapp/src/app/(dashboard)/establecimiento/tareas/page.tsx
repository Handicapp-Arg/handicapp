'use client';

import React, { useMemo, useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaList } from '@/components/dashboard';
import { useTareas } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, Filter, X } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function EstablecimientoTareasPage() {
  const { data: tareas = [], isLoading: loading } = useTareas({ page: 1, limit: 500 });
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const tareasStats = useMemo(() => {
    const tareasArray = Array.isArray(tareas) ? tareas : (tareas as any)?.data || [];
    const now = new Date();
    
    const total = tareasArray.length;
    const pendientes = tareasArray.filter((t: any) => t.estado === 'pendiente').length;
    const completadas = tareasArray.filter((t: any) => t.estado === 'completada').length;
    const vencidas = tareasArray.filter((t: any) => {
      if (t.estado === 'completada') return false;
      const fechaVencimiento = new Date(t.fecha_vencimiento);
      return fechaVencimiento < now;
    }).length;

    return { total, pendientes, completadas, vencidas };
  }, [tareas]);

  // Función para aplicar filtros
  const tareasFiltradas = useMemo(() => {
    let tareasArray = Array.isArray(tareas) ? tareas : (tareas as any)?.data || [];
    
    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      tareasArray = tareasArray.filter((t: any) => t.estado === filtroEstado);
    }
    
    // Filtrar por prioridad
    if (filtroPrioridad !== 'todas') {
      tareasArray = tareasArray.filter((t: any) => t.prioridad === filtroPrioridad);
    }
    
    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      tareasArray = tareasArray.filter((t: any) => t.tipo === filtroTipo);
    }
    
    return tareasArray;
  }, [tareas, filtroEstado, filtroPrioridad, filtroTipo]);

  const limpiarFiltros = () => {
    setFiltroEstado('todos');
    setFiltroPrioridad('todas');
    setFiltroTipo('todos');
  };

  const hayFiltrosActivos = filtroEstado !== 'todos' || filtroPrioridad !== 'todas' || 
                           filtroTipo !== 'todos';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." variant="success" />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-500/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20">
                      <ClipboardList className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">Gestión de Tareas</h1>
                      <p className="text-slate-300">Organiza y monitorea las tareas del establecimiento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Tareas */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <ClipboardList className="w-8 h-8 text-orange-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Total
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Total Tareas</p>
                  <p className="text-3xl font-bold text-white">{tareasStats.total}</p>
                  <p className="text-xs text-slate-400">En el sistema</p>
                </div>
              </div>
            </div>

            {/* Pendientes */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-amber-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Pendientes
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Pendientes</p>
                  <p className="text-3xl font-bold text-white">{tareasStats.pendientes}</p>
                  <p className="text-xs text-slate-400">Por realizar</p>
                </div>
              </div>
            </div>

            {/* Completadas */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    {((tareasStats.completadas / tareasStats.total) * 100 || 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Completadas</p>
                  <p className="text-3xl font-bold text-white">{tareasStats.completadas}</p>
                  <p className="text-xs text-slate-400">Finalizadas</p>
                </div>
              </div>
            </div>

            {/* Vencidas */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Vencidas
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Vencidas</p>
                  <p className="text-3xl font-bold text-white">{tareasStats.vencidas}</p>
                  <p className="text-xs text-slate-400">Requieren atención</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Filtros */}
          <Card className="rounded-2xl shadow-xl border-slate-200 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Filtros</h2>
                  {hayFiltrosActivos && (
                    <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-800">
                      Activos
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  {mostrarFiltros ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </CardHeader>
            {mostrarFiltros && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Filtro Estado */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value="todos">Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  {/* Filtro Prioridad */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prioridad
                    </label>
                    <select
                      value={filtroPrioridad}
                      onChange={(e) => setFiltroPrioridad(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value="todas">Todas</option>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  {/* Filtro Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo
                    </label>
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value="todos">Todos</option>
                      <option value="alimentacion">Alimentación</option>
                      <option value="limpieza">Limpieza</option>
                      <option value="entrenamiento">Entrenamiento</option>
                      <option value="veterinaria">Veterinaria</option>
                      <option value="herreria">Herrería</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="administrativa">Administrativa</option>
                      <option value="otra">Otra</option>
                    </select>
                  </div>
                </div>

                {/* Botón Limpiar Filtros */}
                {hayFiltrosActivos && (
                  <div className="flex justify-end">
                    <button
                      onClick={limpiarFiltros}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Limpiar Filtros
                    </button>
                  </div>
                )}

                {/* Indicador de resultados */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600">
                    Mostrando <span className="font-semibold text-slate-900">{tareasFiltradas.length}</span> de{' '}
                    <span className="font-semibold text-slate-900">{tareasStats.total}</span> tareas
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Tareas List */}
          <Card className="rounded-2xl shadow-xl border-slate-200">
            <CardHeader>
              <CardDescription>
                {hayFiltrosActivos 
                  ? `Mostrando ${tareasFiltradas.length} tareas filtradas` 
                  : 'Lista completa de tareas del establecimiento'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TareaList tareasProp={tareasFiltradas} />
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
