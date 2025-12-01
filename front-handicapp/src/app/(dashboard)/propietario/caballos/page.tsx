'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard/CaballoList';
import { useStats } from '@/lib/hooks/useStats';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Trophy, Heart, TrendingUp } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function MisCaballosPage() {
  const { stats, loading: statsLoading } = useStats();
  const { data: caballosData, isLoading: caballosLoading } = useCaballos();
  
  // Asegurar que caballos sea un array
  const caballosList = Array.isArray((caballosData as any)?.data?.caballos) 
    ? (caballosData as any).data.caballos 
    : Array.isArray((caballosData as any)?.caballos) 
      ? (caballosData as any).caballos 
      : Array.isArray((caballosData as any)?.data) 
        ? (caballosData as any).data 
        : Array.isArray(caballosData) 
          ? caballosData 
          : [];

  // Calcular estadísticas adicionales de caballos
  const caballosEnEntrenamiento = caballosList.filter((c: any) => 
    c.estado_global === 'activo' && c._count?.eventos > 0
  ).length;
  
  const caballosLesionados = caballosList.filter((c: any) => 
    c.estado_salud === 'lesionado' || c.estado_salud === 'en_tratamiento'
  ).length;

  const caballosNuevos = caballosList.filter((c: any) => {
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() - 30);
    return new Date(c.creado_el) > treintaDias;
  }).length;

  // Mostrar loading
  if (statsLoading || caballosLoading) {
    return (
      <SimpleRoleGuard roles={['propietario']}>
        <LoadingSpinnerFullPage 
          label="Cargando caballos..." 
          description="Preparando tu haras"
          variant="success"
        />
      </SimpleRoleGuard>
    );
  }

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div>
        {/* Hero Section con Stats Integrados */}
        <div className="relative overflow-hidden mb-8 rounded-2xl">
        {/* Background oscuro */}
        <div className="absolute inset-0 bg-[#0f172a]"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
        
        {/* Gradient orbs - Verde para propietario */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-green-500/20 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              Mis Caballos
            </h1>
            <p className="text-sm sm:text-base text-white/70">
              Administra tu haras completo desde un solo lugar
            </p>
          </div>

          {/* Stats Grid */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              {/* Stat 1 */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                      Total
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                      <Circle className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">{stats.caballos?.total || 0}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    En haras
                  </Badge>
                </CardContent>
              </Card>

              {/* Stat 2 */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-green-300 uppercase tracking-wider">
                      Activos
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-green-500/20">
                      <TrendingUp className="w-3 h-3 text-green-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">{stats.caballos?.activos || 0}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Disponibles
                  </Badge>
                </CardContent>
              </Card>

              {/* Stat 3 */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                      Entrenamiento
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-amber-500/20">
                      <Trophy className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">{caballosEnEntrenamiento}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Con eventos
                  </Badge>
                </CardContent>
              </Card>

              {/* Stat 4 */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider">
                      {caballosLesionados > 0 ? 'Lesionados' : 'Nuevos'}
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-rose-500/20">
                      <Heart className="w-3 h-3 text-rose-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {caballosLesionados > 0 ? caballosLesionados : caballosNuevos}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    {caballosLesionados > 0 ? 'Requieren atención' : 'Últimos 30 días'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Caballos */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <CaballoList />
      </div>
      </div>
    </SimpleRoleGuard>
  );
}
