'use client';

import React, { useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useEventos, useCaballos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Clock, CheckCircle2, AlertCircle, Search, Calendar } from 'lucide-react';
import { Evento } from '@/lib/types';

export default function VeterinarioConsultasPage() {
  const { data: eventos = [], isLoading: loading } = useEventos({ page: 1, limit: 500 });
  const { data: caballosData = [] } = useCaballos({ page: 1, limit: 100 });
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');

  const { consultas, caballos } = useMemo(() => {
    const eventosArray = Array.isArray(eventos) 
      ? eventos 
      : (eventos as { data?: Evento[] })?.data || [];
    
    const caballosArray = Array.isArray(caballosData) 
      ? caballosData 
      : ((caballosData as any)?.data?.caballos || (caballosData as any)?.data || []);
    
    const consultasData = eventosArray.filter((e: Evento) => 
      e.tipo_evento?.nombre?.toLowerCase().includes('consulta') ||
      e.tipo_evento?.categoria?.toLowerCase().includes('veterinaria')
    );
    
    return { consultas: consultasData, caballos: caballosArray };
  }, [eventos, caballosData]);

  const stats = useMemo(() => {
    const total = consultas.length;
    const pendientes = consultas.filter((c: any) => c.estado === 'pendiente').length;
    const completadas = consultas.filter((c: any) => c.estado === 'completado').length;
    const urgentes = consultas.filter((c: any) => c.prioridad === 'alta' || c.prioridad === 'critica').length;
    return { total, pendientes, completadas, urgentes };
  }, [consultas]);

  const consultasFiltradas = consultas.filter((c: any) => {
    const matchesSearch = c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFiltro === 'todos' || c.estado === estadoFiltro;
    return matchesSearch && matchesEstado;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Consultas Veterinarias</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Gestiona consultas médicas y evaluaciones equinas
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Consultas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Programadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pendientes */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendientes}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Por realizar
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Completadas */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completadas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Finalizadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Urgentes */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Urgentes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.urgentes}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                  Prioridad alta
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardDescription>
              Lista de consultas veterinarias programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar consultas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="completado">Completadas</option>
                <option value="cancelado">Canceladas</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultasFiltradas.map((consulta: any) => (
                    <tr key={consulta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{consulta.titulo || 'Sin título'}</div>
                        <div className="text-sm text-gray-500">{consulta.descripcion || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(consulta.fecha).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={consulta.prioridad === 'alta' || consulta.prioridad === 'critica' ? 'destructive' : 'default'}>
                          {consulta.prioridad || 'Normal'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={consulta.estado === 'completado' ? 'default' : 'secondary'}>
                          {consulta.estado || 'Pendiente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {consultasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron consultas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
