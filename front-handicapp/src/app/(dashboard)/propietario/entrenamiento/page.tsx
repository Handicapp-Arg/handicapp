'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useEventos, useCaballos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Activity, Target, TrendingUp } from 'lucide-react';

export default function PropietarioEntrenamientoPage() {
  const { data: eventosResponse, isLoading: loadingEventos } = useEventos({ search: 'entrenamiento', page: 1, limit: 50 });
  const { data: caballosResponse, isLoading: loadingCaballos } = useCaballos({ page: 1, limit: 100 });

  const eventos = useMemo(() => {
    const data = (eventosResponse as { data?: any[] })?.data || [];
    return Array.isArray(data) ? data : [];
  }, [eventosResponse]);

  const caballos = useMemo(() => {
    const data = (caballosResponse as { data?: { caballos?: any[] } })?.data?.caballos || [];
    return Array.isArray(data) ? data : [];
  }, [caballosResponse]);

  const stats = useMemo(() => ({
    total: caballos.length,
    enEntrenamiento: caballos.filter((c: any) => c.estado_global === 'activo').length,
    sesionesHoy: eventos.filter((e: any) => {
      const hoy = new Date().toISOString().slice(0, 10);
      const fechaEvento = new Date(e.fecha_evento).toISOString().slice(0, 10);
      return fechaEvento === hoy;
    }).length,
    proximas: eventos.filter((e: any) => {
      const fecha = new Date(e.fecha_evento);
      const hoy = new Date();
      return fecha >= hoy;
    }).length
  }), [caballos, eventos]);

  if (loadingEventos || loadingCaballos) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Entrenamiento</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Gestiona el plan de entrenamiento de tus caballos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Caballos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-blue-600" />
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
                  <p className="text-gray-600 text-sm font-medium">En Entrenamiento</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.enEntrenamiento}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Activos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Sesiones Hoy</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sesionesHoy}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Programadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Próximas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.proximas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Futuras
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <h3 className="font-semibold text-lg">Sesiones de Entrenamiento</h3>
            <CardDescription>Próximas sesiones programadas</CardDescription>
          </CardHeader>
          <CardContent>
            {eventos.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No hay sesiones de entrenamiento programadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventos.slice(0, 10).map((evento: any) => (
                  <div key={evento.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{evento.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{evento.descripcion || 'Sin descripción'}</p>
                        {evento.caballo?.nombre && (
                          <span className="text-sm text-gray-500 mt-2 block">Caballo: {evento.caballo.nombre}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
