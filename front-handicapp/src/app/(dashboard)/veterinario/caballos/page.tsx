'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useCaballos } from '@/lib/hooks';
import { Stethoscope, TrendingUp, Activity, Heart } from 'lucide-react';
import CardGridSkeleton from '@/components/skeletons/CardGridSkeleton';

export default function VeterinarioCaballosPage() {
  const { data, isLoading } = useCaballos({ page: 1, limit: 500 });

  const stats = useMemo(() => {
    const list = Array.isArray(data)
      ? data
      : (data as any)?.data?.caballos || (data as any)?.data || [];
    return {
      total: list.length,
      saludables: list.filter((c: any) => c.estado_salud === 'saludable').length,
      enTratamiento: list.filter((c: any) => c.estado_salud === 'en_tratamiento').length,
      disponibles: list.filter((c: any) => c.disponible).length,
    };
  }, [data]);

  if (isLoading) return <CardGridSkeleton cards={6} columns={3} />;

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        <PageHeader
          title="Pacientes Equinos"
          subtitle="Gestiona el cuidado médico y salud de los caballos"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Pacientes"
            value={stats.total}
            icon={Stethoscope}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            subtitle="bajo cuidado"
            accentBg="bg-violet-50"
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
            subtitle="para eventos"
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
