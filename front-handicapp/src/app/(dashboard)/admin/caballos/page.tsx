'use client';

import { useStats } from '@/lib/hooks/useStats';
import { CaballoList } from '@/components/dashboard/CaballoList';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, TrendingUp, Calendar, Heart } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function CaballosPage() {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." variant="primary" />
      </div>
    );
  }

  return (
    <SimpleAdminOnly>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden mb-8 rounded-2xl">
          <div className="absolute inset-0 bg-[#0f172a]"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-slate-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gray-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-6">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                Gestión de Caballos
              </h1>
              <p className="text-sm sm:text-base text-white/70">
                Administra el registro completo de equinos, historial médico y cuidados
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                      Total Caballos
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-slate-500/20">
                      <Circle className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">{stats.caballos?.total || 0}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Registrados
                  </Badge>
                </CardContent>
              </Card>

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
                    En estado activo
                  </Badge>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                      Con Eventos
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-purple-500/20">
                      <Calendar className="w-3 h-3 text-purple-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">{stats.caballos?.conEventos || 0}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Programados
                  </Badge>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                      En Cuidado
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-amber-500/20">
                      <Heart className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">{stats.caballos?.nuevos || 0}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Últimos 30 días
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* List Component */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <CaballoList />
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
