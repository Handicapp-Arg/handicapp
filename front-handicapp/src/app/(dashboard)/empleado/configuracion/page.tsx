'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Building2, MapPin, Phone, Mail } from 'lucide-react';

interface Establecimiento {
  id: number;
  nombre: string;
  direccion?: string;
  capacidad?: number;
  telefono?: string;
  email?: string;
  superficie_hectareas?: number;
}

export default function EmpleadoConfiguracionPage() {
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstablecimiento();
  }, []);

  const fetchEstablecimiento = async () => {
    try {
      setLoading(true);
      const response: any = await ApiClient.makeRequest('/establecimientos', {
        method: 'GET'
      });
      
      if (response?.data?.items && response.data.items.length > 0) {
        setEstablecimiento(response.data.items[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    capacidad: establecimiento?.capacidad || 0,
    superficie: establecimiento?.superficie_hectareas || 0,
    contactos: [establecimiento?.telefono, establecimiento?.email].filter(Boolean).length,
    configurado: establecimiento ? 100 : 0,
  }), [establecimiento]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['empleado']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-teal-400" />
              <h1 className="text-3xl font-bold text-white">Configuración del Establecimiento</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Información del establecimiento (solo lectura)
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
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
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
                  Configurados
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completado</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.configurado}%</p>
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
        <Card className="rounded-2xl shadow-xl bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Solo Lectura</h3>
                <p className="text-sm text-gray-600">
                  Como capataz, puedes ver la información del establecimiento pero no modificarla. 
                  Contacta al propietario para realizar cambios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        {establecimiento && (
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardDescription>Detalles del establecimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{establecimiento.nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dirección</label>
                    <p className="mt-1 text-gray-900">{establecimiento.direccion || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Capacidad</label>
                    <p className="mt-1 text-gray-900">{establecimiento.capacidad || 0} caballos</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="mt-1 text-gray-900">{establecimiento.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{establecimiento.email || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Superficie</label>
                    <p className="mt-1 text-gray-900">{establecimiento.superficie_hectareas || 0} hectáreas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SimpleRoleGuard>
  );
}
