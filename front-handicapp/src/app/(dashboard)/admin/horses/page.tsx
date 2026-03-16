'use client';

import { useStats } from '@/lib/hooks/useStats';
import { CaballoList } from '@/components/dashboard/CaballoList';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, TrendingUp, Calendar, Heart } from 'lucide-react';
import { PageShell } from '@/components/ui/page-shell';
export default function CaballosPage() {
  const { stats, loading } = useStats();

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-md animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-gray-100 rounded-md animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <SimpleAdminOnly>
      <PageShell
        title="Gestión de Caballos"
        description="Administra el registro completo de equinos, historial médico y cuidados"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Total Caballos
                </CardDescription>
                <div className="p-1.5 rounded-md bg-gray-100">
                  <Circle className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-2xl font-bold tabular-nums">{stats.caballos?.total || 0}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                Registrados
              </Badge>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                  Activos
                </CardDescription>
                <div className="p-1.5 rounded-md bg-green-50">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-2xl font-bold tabular-nums">{stats.caballos?.activos || 0}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                En estado activo
              </Badge>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
                  Con Eventos
                </CardDescription>
                <div className="p-1.5 rounded-md bg-purple-50">
                  <Calendar className="w-3 h-3 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-2xl font-bold tabular-nums">{stats.caballos?.conEventos || 0}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                Programados
              </Badge>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                  En Cuidado
                </CardDescription>
                <div className="p-1.5 rounded-md bg-amber-50">
                  <Heart className="w-3 h-3 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-2xl font-bold tabular-nums">{stats.caballos?.nuevos || 0}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                Últimos 30 días
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* List Component */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <CaballoList />
        </div>
      </PageShell>
    </SimpleAdminOnly>
  );
}

