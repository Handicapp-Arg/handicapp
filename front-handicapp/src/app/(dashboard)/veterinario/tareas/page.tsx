'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaList } from '@/components/dashboard';
import { useTareas } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function VeterinarioTareasPage() {
  const { data, isLoading } = useTareas({ page: 1, limit: 500 });

  const stats = useMemo(() => {
    const tareas = Array.isArray(data) 
      ? data 
      : (data as any)?.data || [];
    
    const now = new Date();
    const total = tareas.length;
    const pendientes = tareas.filter((t: any) => t.estado === 'pendiente').length;
    const completadas = tareas.filter((t: any) => t.estado === 'completada').length;
    const vencidas = tareas.filter((t: any) => {
      if (t.estado === 'completada') return false;
      const fechaVencimiento = new Date(t.fecha_vencimiento);
      return fechaVencimiento < now;
    }).length;

    return { total, pendientes, completadas, vencidas };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <ClipboardList className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Tareas Veterinarias</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Administra seguimientos médicos y cuidados veterinarios
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
                  <p className="text-gray-600 text-sm font-medium">Total Tareas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Asignadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pendientes */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendientes}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Por hacer
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Completadas */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completadas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Finalizadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Vencidas */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Vencidas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.vencidas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                  Atrasadas
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardDescription>
              Lista completa de tareas veterinarias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TareaList />
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
