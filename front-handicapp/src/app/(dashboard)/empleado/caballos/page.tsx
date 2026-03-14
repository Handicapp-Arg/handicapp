'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useCaballos } from '@/lib/hooks';
import { Fence, TrendingUp, Activity, Heart } from 'lucide-react';
import CardGridSkeleton from '@/components/skeletons/CardGridSkeleton';

export default function EmpleadoCaballosPage() {
  const { data: caballos = [], isLoading: loading } = useCaballos({ page: 1, limit: 500 });

  const stats = useMemo(() => {
    const list = Array.isArray(caballos)
      ? caballos
      : (caballos as any)?.data?.caballos || (caballos as any)?.data || [];
    return {
      total: list.length,
      saludables: list.filter((c: any) => c.estado_salud === 'saludable').length,
      enTratamiento: list.filter((c: any) => c.estado_salud === 'en_tratamiento').length,
      disponibles: list.filter((c: any) => c.disponible).length,
    };
  }, [caballos]);

  if (loading) return <CardGridSkeleton cards={8} columns={4} />;

  return (
    <SimpleRoleGuard roles={['empleado']}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <PageHeader
          title="Caballos"
          subtitle="Listado de caballos bajo tu cuidado"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Caballos"
            value={stats.total}
            icon={Fence}
            iconColor="text-slate-500"
            iconBg="bg-slate-100"
            subtitle="a tu cuidado"
          />
          <StatCard
            title="Saludables"
            value={stats.saludables}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            subtitle={`${Math.round((stats.saludables / (stats.total || 1)) * 100)}% del total`}
            accentBg="bg-emerald-50"
          />
          <StatCard
            title="En Tratamiento"
            value={stats.enTratamiento}
            icon={Activity}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            subtitle="requieren atención"
            accentBg="bg-amber-50"
          />
          <StatCard
            title="Disponibles"
            value={stats.disponibles}
            icon={Heart}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            subtitle="para actividades"
            accentBg="bg-blue-50"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-6">
          <CaballoList />
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
