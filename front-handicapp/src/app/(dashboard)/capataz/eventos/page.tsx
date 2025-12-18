'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { EventoList } from '@/components/dashboard';
import { useEventos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function CapatazEventosPage() {
  const { data: eventos = [], isLoading: loading } = useEventos({ page: 1, limit: 500 });

  const eventosStats = useMemo(() => {
    const eventosArray = Array.isArray(eventos) 
      ? eventos 
      : (eventos as any)?.data || [];
    
    const now = new Date();
    
    const total = eventosArray.length;
    const proximos = eventosArray.filter((e: any) => new Date(e.fecha) > now && e.estado !== 'cancelado').length;
    const completados = eventosArray.filter((e: any) => e.estado === 'completado').length;
    const cancelados = eventosArray.filter((e: any) => e.estado === 'cancelado').length;

    return { total, proximos, completados, cancelados };
  }, [eventos]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." variant="warning" />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['capataz']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-500/10 backdrop-blur-sm rounded-2xl border border-orange-500/20">
                      <Calendar className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">Calendario de Eventos</h1>
                      <p className="text-slate-300">Planifica actividades importantes con fecha y hora específica</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-orange-200 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 backdrop-blur-sm w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Incluye eventos manuales y auto-generados al completar tareas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-purple-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Total
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Total Eventos</p>
                  <p className="text-3xl font-bold text-white">{eventosStats.total}</p>
                  <p className="text-xs text-slate-400">En el sistema</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-blue-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Próximos
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Programados</p>
                  <p className="text-3xl font-bold text-white">{eventosStats.proximos}</p>
                  <p className="text-xs text-slate-400">Por realizar</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    {((eventosStats.completados / eventosStats.total) * 100 || 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Completados</p>
                  <p className="text-3xl font-bold text-white">{eventosStats.completados}</p>
                  <p className="text-xs text-slate-400">Finalizados con éxito</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Cancelados
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Cancelados</p>
                  <p className="text-3xl font-bold text-white">{eventosStats.cancelados}</p>
                  <p className="text-xs text-slate-400">No realizados</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-2xl shadow-xl border-slate-200">
            <CardHeader>
              <CardDescription>
                Lista completa de eventos del establecimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventoList />
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
