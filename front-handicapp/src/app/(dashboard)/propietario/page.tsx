'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { 
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  HeartIcon,
  InformationCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PropietarioDashboard() {
  const quickActions = [
    {
      title: 'Mis Caballos',
      description: 'Caballos de mi propiedad',
      href: '/propietario/caballos',
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Estado de Salud',
      description: 'Historial médico y consultas',
      href: '/propietario/salud',
      icon: HeartIcon,
      color: 'bg-red-500'
    },
    {
      title: 'Eventos',
      description: 'Competencias y entrenamientos',
      href: '/propietario/eventos',
      icon: CalendarDaysIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Informes',
      description: 'Reportes de actividades',
      href: '/propietario/informes',
      icon: InformationCircleIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Facturación',
      description: 'Gastos y pagos',
      href: '/propietario/facturacion',
      icon: CurrencyDollarIcon,
      color: 'bg-indigo-500'
    },
    {
      title: 'Documentos',
      description: 'Registros y certificados',
      href: '/propietario/documentos',
      icon: DocumentTextIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <SimpleRoleGuard roles={['propietario']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo propietarios pueden acceder</p>
        </div>
      </div>
    }>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Propietario</h1>
          <p className="text-gray-600">Gestiona tus caballos y su bienestar</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Caballos</CardTitle>
              <ClipboardDocumentListIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Total registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas</CardTitle>
              <HeartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Veterinarias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Propietario</h2>
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
