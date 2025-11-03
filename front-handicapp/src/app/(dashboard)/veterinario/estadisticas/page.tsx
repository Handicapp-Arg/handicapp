'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, AlertCircle, Heart, Syringe, Users, CheckCircle, Clock } from 'lucide-react';

export default function VeterinarioEstadisticasPage() {
  const { stats, loading } = useStats();

  const veterinarioStats = useMemo(() => {
    return {
      consultas: stats.eventos?.total || 0,
      tratamientos: stats.eventos?.programados || 0,
      pacientes: stats.caballos?.total || 0,
      vacunas: stats.eventos?.completados || 0
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Estadísticas Veterinarias</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Métricas y análisis del desempeño médico
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Consultas Totales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{veterinarioStats.consultas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Realizadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tratamientos Activos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{veterinarioStats.tratamientos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  En curso
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pacientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{veterinarioStats.pacientes}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Total
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Vacunas Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{veterinarioStats.vacunas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Syringe className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Programadas
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Métricas de Rendimiento */}
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-lg">Rendimiento General</h3>
                  <CardDescription>Métricas clave del servicio veterinario</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Consultas Completadas</p>
                      <p className="text-sm text-gray-600">Último mes</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-purple-600">
                    {stats.eventos?.total || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tratamientos Exitosos</p>
                      <p className="text-sm text-gray-600">Tasa de éxito</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    95%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tiempo Promedio</p>
                      <p className="text-sm text-gray-600">Por consulta</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-amber-600">
                    45 min
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas y Prioridades */}
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-lg">Alertas Sanitarias</h3>
                  <CardDescription>Casos que requieren atención</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Críticas</p>
                      <p className="text-sm text-gray-600">Atención inmediata</p>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {stats.eventos?.urgentes || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Moderadas</p>
                      <p className="text-sm text-gray-600">Seguimiento requerido</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-amber-600">
                    {stats.tareas?.pendientes || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Informativas</p>
                      <p className="text-sm text-gray-600">Para conocimiento</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-blue-600">
                    {stats.tareas?.completadas || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
