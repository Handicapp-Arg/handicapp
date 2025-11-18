'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard';
import { useCaballos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, TrendingUp, Activity, Heart } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function VeterinarioCaballosPage() {
  const { data, isLoading } = useCaballos({ page: 1, limit: 500 });

  const stats = useMemo(() => {
    const caballosArray = Array.isArray(data) 
      ? data 
      : (data as any)?.data?.caballos || (data as any)?.data || [];
    
    const total = caballosArray.length;
    const saludables = caballosArray.filter((c: any) => c.estado_salud === 'saludable').length;
    const enTratamiento = caballosArray.filter((c: any) => c.estado_salud === 'en_tratamiento').length;
    const disponibles = caballosArray.filter((c: any) => c.disponible).length;

    return { total, saludables, enTratamiento, disponibles };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." variant="warning" />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Pacientes Equinos</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Gestiona el cuidado médico y salud de los caballos
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Pacientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Bajo cuidado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Saludables */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Saludables</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.saludables}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  {Math.round((stats.saludables / (stats.total || 1)) * 100)}% del total
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* En Tratamiento */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">En Tratamiento</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.enTratamiento}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                  Requieren atención
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Disponibles */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Disponibles</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.disponibles}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Para eventos
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardDescription>
              Registro médico completo de pacientes equinos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CaballoList />
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
