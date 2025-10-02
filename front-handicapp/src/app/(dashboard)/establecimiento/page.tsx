'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { 
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function EstablecimientoDashboard() {
  const quickActions = [
    {
      title: 'Mi Establecimiento',
      description: 'Gestionar información del establecimiento',
      href: '/establecimiento/perfil',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Caballos',
      description: 'Caballos del establecimiento',
      href: '/establecimiento/caballos',
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Eventos',
      description: 'Eventos programados',
      href: '/establecimiento/eventos',
      icon: CalendarDaysIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Tareas',
      description: 'Tareas del establecimiento',
      href: '/establecimiento/tareas',
      icon: DocumentTextIcon,
      color: 'bg-orange-500'
    },
    {
      title: 'Personal',
      description: 'Gestionar equipo de trabajo',
      href: '/establecimiento/personal',
      icon: UserGroupIcon,
      color: 'bg-indigo-500'
    },
    {
      title: 'Configuración',
      description: 'Configurar establecimiento',
      href: '/establecimiento/configuracion',
      icon: CogIcon,
      color: 'bg-gray-500'
    }
  ];

  return (
    <SimpleRoleGuard roles={['establecimiento']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo propietarios de establecimiento pueden acceder</p>
        </div>
      </div>
    }>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Establecimiento</h1>
          <p className="text-gray-600">Gestiona tu establecimiento ecuestre</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Caballos</CardTitle>
              <ClipboardDocumentListIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">En el establecimiento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal</CardTitle>
              <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Empleados activos</p>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Por completar</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión del Establecimiento</h2>
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
      </div>
    </SimpleRoleGuard>
  );
}
