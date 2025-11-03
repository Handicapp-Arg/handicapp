'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { EventoList } from '@/components/dashboard';
import { useEventos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function EstablecimientoEventosPage() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-6 sm:mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 sm:w-72 sm:h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 sm:w-72 sm:h-72 bg-green-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-emerald-500/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-emerald-500/20 flex-shrink-0">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1 truncate">Gestión de Eventos</h1>
                      <p className="text-xs sm:text-sm md:text-base text-slate-300 truncate">Organiza y monitorea eventos del establecimiento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {/* Total Eventos */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Total
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">Total Eventos</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{eventosStats.total}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">En el sistema</p>
                </div>
              </div>
            </div>

            {/* Próximos */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Próximos
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">Programados</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{eventosStats.proximos}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Por realizar</p>
                </div>
              </div>
            </div>

            {/* Completados */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    {((eventosStats.completados / eventosStats.total) * 100 || 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">Completados</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{eventosStats.completados}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Finalizados con éxito</p>
                </div>
              </div>
            </div>

            {/* Cancelados */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Cancelados
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">Cancelados</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{eventosStats.cancelados}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">No realizados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Eventos List */}
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
