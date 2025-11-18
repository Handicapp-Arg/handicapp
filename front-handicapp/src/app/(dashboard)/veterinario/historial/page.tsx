'use client';

import React, { useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useCaballos } from '@/lib/hooks';
import { Caballo } from '@/lib/types';
import { historialMedicoService, RegistroMedico } from '@/lib/services/historialMedicoService';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Activity, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function VeterinarioHistorialPage() {
  const { data: caballosData = [], isLoading: loading } = useCaballos({ page: 1, limit: 100 });
  const [selectedCaballo, setSelectedCaballo] = useState<number | null>(null);
  const [historial, setHistorial] = useState<RegistroMedico[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const caballos = Array.isArray(caballosData) 
    ? caballosData 
    : ((caballosData as { data?: { caballos?: Caballo[] } })?.data?.caballos 
      || (caballosData as { data?: Caballo[] })?.data 
      || []);

  const fetchHistorial = async (caballoId: number) => {
    try {
      setLoadingHistorial(true);
      const data = await historialMedicoService.getHistorialCaballo(caballoId);
      setHistorial(data);
    } catch (error) {
      console.error('Error fetching historial:', error);
      toast.error('Error al cargar el historial médico');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleSelectCaballo = (caballoId: number) => {
    setSelectedCaballo(caballoId);
    fetchHistorial(caballoId);
  };

  const stats = useMemo(() => ({
    total: caballos.length,
    selected: selectedCaballo ? 1 : 0,
    registros: historial.length,
    recientes: historial.filter((h: RegistroMedico) => {
      const fecha = new Date(h.fecha_evento || '');
      const hoy = new Date();
      const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 30;
    }).length
  }), [caballos, selectedCaballo, historial]);

  const selectedCaballoData = caballos.find((c: Caballo) => c.id === selectedCaballo);

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando..." variant="warning" />;
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
              <FileText className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Historial Médico</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Accede al historial médico completo de cada paciente
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Pacientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Disponibles
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Paciente Actual</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.selected}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Seleccionado
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Registros</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.registros}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Historial
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Últimos 30 Días</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.recientes}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Recientes
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Caballos */}
          <Card className="lg:col-span-1 rounded-2xl shadow-xl">
            <CardHeader>
              <h3 className="font-semibold text-lg">Pacientes ({caballos.length})</h3>
              <CardDescription>Selecciona un paciente para ver su historial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {caballos.map((caballo: Caballo) => (
                  <button
                    key={caballo.id}
                    onClick={() => handleSelectCaballo(caballo.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedCaballo === caballo.id
                        ? 'bg-purple-100 border-2 border-purple-600 shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedCaballo === caballo.id ? 'bg-purple-600' : 'bg-gray-300'
                      }`}>
                        <span className="text-white text-sm">🐎</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {caballo.nombre}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {caballo.raza || 'Sin raza'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historial Médico */}
          <div className="lg:col-span-2">
            {selectedCaballo ? (
              <Card className="rounded-2xl shadow-xl">
                {/* Cabecera del Paciente */}
                <div className="p-6 border-b border-gray-200 bg-purple-50 rounded-t-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">🐎</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCaballoData?.nombre}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Raza</p>
                          <p className="font-medium text-gray-900">{selectedCaballoData?.raza || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Edad</p>
                          <p className="font-medium text-gray-900">{selectedCaballoData?.edad || 0} años</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Sexo</p>
                          <p className="font-medium text-gray-900">{selectedCaballoData?.sexo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Microchip</p>
                          <p className="font-medium text-gray-900 truncate">{selectedCaballoData?.microchip || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido del Historial */}
                <CardContent className="p-6">
                  {loadingHistorial ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinnerFullPage label="Cargando..." variant="warning" />
                    </div>
                  ) : historial.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Sin historial médico
                      </h3>
                      <p className="text-gray-600">
                        Este paciente aún no tiene registros médicos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historial.map((evento) => (
                        <div
                          key={evento.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-purple-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{evento.titulo}</h4>
                                  <Badge variant="outline" className="mt-1">
                                    {evento.tipo_evento?.nombre || evento.tipo || 'N/A'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(evento.fecha_evento || '').toLocaleDateString('es-AR')}
                                </div>
                              </div>
                              {evento.descripcion && (
                                <p className="text-gray-700 text-sm mt-2">{evento.descripcion}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl shadow-xl">
                <CardContent className="p-12 text-center">
                  <FileText className="w-20 h-20 text-purple-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona un paciente
                  </h3>
                  <p className="text-gray-600">
                    Elige un caballo de la lista para ver su historial médico completo
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
