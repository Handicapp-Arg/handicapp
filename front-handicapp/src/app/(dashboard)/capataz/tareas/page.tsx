'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaList } from '@/components/dashboard';
import { useTareas } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CapatazTareasPage() {
  const { data: tareas = [], isLoading: loading } = useTareas({ page: 1, limit: 500 });

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
                      <ClipboardList className="w-8 h-8 text-orange-400" />
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

          <Card className="rounded-2xl shadow-xl border-slate-200">
            <CardHeader>
              <CardDescription>
                Lista completa de tareas del establecimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TareaList />
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
