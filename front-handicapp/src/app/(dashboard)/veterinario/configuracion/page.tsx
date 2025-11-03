'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useEstablecimientos } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Building2, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';

export default function VeterinarioConfiguracionPage() {
  const { data: establecimientos = [], isLoading: loading } = useEstablecimientos();
  
  const establecimiento = (Array.isArray(establecimientos) && establecimientos.length > 0
    ? establecimientos[0]
    : (establecimientos as { data?: { items?: any[] } })?.data?.items?.[0] || null) as any;

  const stats = useMemo(() => ({
    capacidad: establecimiento?.capacidad || 0,
    superficie: establecimiento?.superficie_hectareas || 0,
    contactos: [establecimiento?.telefono, establecimiento?.email].filter(Boolean).length,
    completado: Math.round(
      ([establecimiento?.nombre, establecimiento?.direccion, establecimiento?.capacidad, establecimiento?.telefono, establecimiento?.email, establecimiento?.superficie_hectareas]
        .filter(Boolean).length / 6) * 100
    )
  }), [establecimiento]);

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
              <Settings className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Información del Establecimiento</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Visualiza la información del establecimiento (solo lectura)
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Capacidad</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.capacidad}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Caballos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Superficie</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.superficie}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Hectáreas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Contactos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.contactos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Datos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completado</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completado}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Perfil
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-800">Solo Lectura</p>
              <p className="text-sm text-purple-700 mt-1">
                Como veterinario, puedes ver la información del establecimiento pero no modificarla. 
                Contacta al propietario para realizar cambios.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Display */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-lg">Información General</h3>
                <CardDescription>Datos del establecimiento</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Establecimiento
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {establecimiento?.nombre || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {establecimiento?.email || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {establecimiento?.telefono || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad (Caballos)
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {establecimiento?.capacidad ? `${establecimiento.capacidad} caballos` : 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie (Hectáreas)
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {establecimiento?.superficie_hectareas ? `${establecimiento.superficie_hectareas} ha` : 'No especificado'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[100px]">
                {establecimiento?.direccion || 'No especificado'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
