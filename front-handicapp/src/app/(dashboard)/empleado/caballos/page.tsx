'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard';
import { useCaballos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Activity, Heart, TrendingUp } from 'lucide-react';

export default function EmpleadoCaballosPage() {
  const { data: caballos = [], isLoading: loading } = useCaballos({ page: 1, limit: 500 });

  const caballosStats = useMemo(() => {
    const caballosArray = Array.isArray(caballos) 
      ? caballos 
      : (caballos as any)?.data?.caballos || (caballos as any)?.data || [];
    
    const total = caballosArray.length;
    const activos = caballosArray.filter((c: any) => c.estado_salud === 'saludable').length;
    const enTratamiento = caballosArray.filter((c: any) => c.estado_salud === 'en_tratamiento').length;
    const disponibles = caballosArray.filter((c: any) => c.disponible).length;

    return { total, activos, enTratamiento, disponibles };
  }, [caballos]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['empleado']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-teal-500/10 backdrop-blur-sm rounded-2xl border border-teal-500/20">
                      <Circle className="w-8 h-8 text-teal-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">Gestión de Caballos</h1>
                      <p className="text-slate-300">Administra todos los caballos del establecimiento</p>
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Circle className="w-8 h-8 text-teal-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Total
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Total Caballos</p>
                  <p className="text-3xl font-bold text-white">{caballosStats.total}</p>
                  <p className="text-xs text-slate-400">Registrados en el sistema</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    {((caballosStats.activos / caballosStats.total) * 100 || 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Saludables</p>
                  <p className="text-3xl font-bold text-white">{caballosStats.activos}</p>
                  <p className="text-xs text-slate-400">En buen estado de salud</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-orange-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Médico
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">En Tratamiento</p>
                  <p className="text-3xl font-bold text-white">{caballosStats.enTratamiento}</p>
                  <p className="text-xs text-slate-400">Requieren atención médica</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8 text-purple-400" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm">
                    Activos
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Disponibles</p>
                  <p className="text-3xl font-bold text-white">{caballosStats.disponibles}</p>
                  <p className="text-xs text-slate-400">Para actividades</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-2xl shadow-xl border-slate-200">
            <CardHeader>
              <CardDescription>
                Lista completa de caballos del establecimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaballoList />
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
