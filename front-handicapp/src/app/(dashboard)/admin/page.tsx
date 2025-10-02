'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { 
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminDashboard() {
  const quickActions = [
    {
      title: 'Establecimientos',
      description: 'Gestionar todos los establecimientos',
      href: '/admin/establecimientos',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Caballos',
      description: 'Registro global de caballos',
      href: '/admin/caballos',
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Eventos',
      description: 'Todos los eventos del sistema',
      href: '/admin/eventos',
      icon: CalendarDaysIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Tareas',
      description: 'Supervisión global de tareas',
      href: '/admin/tareas',
      icon: DocumentTextIcon,
      color: 'bg-orange-500'
    },
    {
      title: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      href: '/admin/users',
      icon: UserGroupIcon,
      color: 'bg-indigo-500'
    },
    {
      title: 'Estadísticas',
      description: 'Reportes y análisis globales',
      href: '/admin/stats',
      icon: ChartBarIcon,
      color: 'bg-pink-500'
    }
  ];

  return (
    <SimpleAdminOnly fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo administradores pueden acceder</p>
        </div>
      </div>
    }>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Control total del sistema HandicApp</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Establecimientos</CardTitle>
              <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Total registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Usuarios activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Caballos</CardTitle>
              <ClipboardDocumentListIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">En el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Hoy</CardTitle>
              <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Programados</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de Datos</span>
                  <span className="text-sm text-green-600">✅ Operativa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Backend</span>
                  <span className="text-sm text-green-600">✅ Operativa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Servidor</span>
                  <span className="text-sm text-green-600">✅ Operativo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                Alertas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay alertas pendientes
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
