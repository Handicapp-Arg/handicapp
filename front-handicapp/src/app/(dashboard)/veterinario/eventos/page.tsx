'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { EventoList } from '@/components/dashboard';
import { useEventos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function VeterinarioEventosPage() {
  const { data, isLoading } = useEventos({ page: 1, limit: 500 });

  const stats = useMemo(() => {
    const eventos = Array.isArray(data) 
      ? data 
      : (data as any)?.data || [];
    
    const now = new Date();
    const total = eventos.length;
    const proximos = eventos.filter((e: any) => new Date(e.fecha) > now && e.estado !== 'cancelado').length;
    const completados = eventos.filter((e: any) => e.estado === 'completado').length;
    const cancelados = eventos.filter((e: any) => e.estado === 'cancelado').length;

    return { total, proximos, completados, cancelados };
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
              <Calendar className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Eventos Veterinarios</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Gestiona consultas, tratamientos y procedimientos médicos
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
                  <p className="text-gray-600 text-sm font-medium">Total Eventos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Programados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Próximos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Próximos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.proximos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Por realizar
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Completados */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completados}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Finalizados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cancelados */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cancelados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.cancelados}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                  No realizados
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardDescription>
              Lista completa de eventos veterinarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventoList />
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
