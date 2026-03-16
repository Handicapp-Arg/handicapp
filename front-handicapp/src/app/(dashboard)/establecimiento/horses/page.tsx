'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard';
import { PageShell } from '@/components/ui/page-shell';
import { StatCard } from '@/components/ui/stat-card';
import { useCaballos, useAuthNew } from '@/lib/hooks';
import { Fence, TrendingUp, Activity, Heart } from 'lucide-react';

export default function EstablecimientoCaballosPage() {
  const { user } = useAuthNew();
  const establecimientoId = user?.establecimiento_id;

  const { data: caballos = [], isLoading: loading } = useCaballos({
    page: 1,
    limit: 100,
    ...(establecimientoId && { establecimiento: establecimientoId }),
  });

  const stats = useMemo(() => {
    const list = Array.isArray(caballos)
      ? caballos
      : (caballos as any)?.data?.caballos || (caballos as any)?.data || [];
    return {
      total: list.length,
      activos: list.filter((c: any) => c.estado_global === 'activo').length,
      inactivos: list.filter((c: any) => c.estado_global === 'inactivo').length,
      otros: list.filter((c: any) => c.estado_global === 'vendido' || c.estado_global === 'fallecido').length,
    };
  }, [caballos]);

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
    <SimpleRoleGuard roles={['establecimiento']}>
      <PageShell
        title="Gestión de Caballos"
        description="Administra todos los caballos del establecimiento"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            title="Total Caballos"
            value={stats.total}
            icon={Fence}
            iconColor="text-gray-500"
            iconBg="bg-gray-100"
            subtitle="registrados"
          />
          <StatCard
            title="Activos"
            value={stats.activos}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            subtitle={`${Math.round((stats.activos / (stats.total || 1)) * 100)}% del total`}
            accentBg="bg-emerald-50"
          />
          <StatCard
            title="Inactivos"
            value={stats.inactivos}
            icon={Activity}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            subtitle="temporalmente"
            accentBg="bg-amber-50"
          />
          <StatCard
            title="Vendidos/Bajas"
            value={stats.otros}
            icon={Heart}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            subtitle="fuera del sistema"
            accentBg="bg-violet-50"
          />
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-6">
          <CaballoList />
        </div>
      </PageShell>
    </SimpleRoleGuard>
  );
}
