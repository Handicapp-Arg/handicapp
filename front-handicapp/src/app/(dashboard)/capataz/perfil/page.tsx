'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield } from 'lucide-react';

export default function CapatazPerfilPage() {
  const { user } = useAuthNew();

  const stats = useMemo(() => ({
    nombre: user?.nombre || 'Usuario',
    email: user?.email || 'N/A',
    rol: user?.rol?.nombre || 'N/A',
    activo: user?.estado_usuario === 'active',
  }), [user]);

  return (
    <SimpleRoleGuard roles={['capataz']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-8 h-8 text-orange-400" />
              <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Información personal de tu cuenta
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Nombre</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.nombre}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Usuario
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Email</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 truncate">{stats.email}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Contacto
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Rol</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.rol}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Permisos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Estado</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.activo ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stats.activo ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <User className={`w-6 h-6 ${stats.activo ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant={stats.activo ? 'default' : 'secondary'} className={stats.activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                  {stats.activo ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
