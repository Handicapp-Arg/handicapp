'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard';
import { useCaballos } from '@/lib/hooks';
import { useStats } from '@/lib/hooks/useStats';
import { useEstablecimientos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Activity, Heart, TrendingUp } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function EstablecimientoCaballosPage() {
  const { stats, loading: statsLoading } = useStats();
  const { data: establecimientos = [], isLoading: loadingEst } = useEstablecimientos();
  
  const establecimiento = Array.isArray(establecimientos) && establecimientos.length > 0
    ? establecimientos[0]
    : (establecimientos as any)?.data?.items?.[0] || null;
  
  const establecimientoId = establecimiento?.id;
  
  const { data: caballos = [], isLoading: loading } = useCaballos({ 
    page: 1, 
    limit: 100,
    ...(establecimientoId && { establecimiento: establecimientoId })
  });

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

  if (loading || loadingEst) {
    return <LoadingSpinnerFullPage label="Cargando..." />;
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
                      <Circle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1 truncate">Gestión de Caballos</h1>
                      <p className="text-xs sm:text-sm md:text-base text-slate-300 truncate">Administra todos los caballos del establecimiento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {/* Total Caballos */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <Circle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Total
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">Total Caballos</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{caballosStats.total}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Registrados en el sistema</p>
                </div>
              </div>
            </div>

            {/* Saludables */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    {((caballosStats.activos / caballosStats.total) * 100 || 0).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">Saludables</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{caballosStats.activos}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">En buen estado de salud</p>
                </div>
              </div>
            </div>

            {/* En Tratamiento */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Médico
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">En Tratamiento</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{caballosStats.enTratamiento}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Requieren atención médica</p>
                </div>
              </div>
            </div>

            {/* Disponibles */}
            <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-400 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/5 text-white border-white/10 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Activos
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-300 truncate">Disponibles</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{caballosStats.disponibles}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Para actividades</p>
                </div>
              </div>
            </div>
          </div>

          {/* Caballos List */}
          <Card className="rounded-xl sm:rounded-2xl shadow-xl border-slate-200">
            <CardHeader className="px-4 sm:px-6">
              <CardDescription className="text-xs sm:text-sm">
                Lista completa de caballos del establecimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              <CaballoList />
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
