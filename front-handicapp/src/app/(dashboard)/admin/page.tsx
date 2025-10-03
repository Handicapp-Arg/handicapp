'use client';

import React from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import Link from 'next/link';
import { StatsCards } from './components/StatsCards';

export default function AdminDashboard() {
  // Datos del sistema simplificados y priorizados
  const priorityStats = [
    {
      title: 'Usuarios Totales',
      value: '248',
      change: '+12 este mes',
      icon: '👥',
      color: 'blue',
      href: '/admin/users'
    },
    {
      title: 'Establecimientos',
      value: '12',
      change: '2 nuevos',
      icon: '🏢',
      color: 'green',
      href: '/admin/establecimientos'
    },
    {
      title: 'Caballos',
      value: '1,047',
      change: '+23 esta semana',
      icon: '�',
      color: 'purple',
      href: '/admin/caballos'
    },
    {
      title: 'Eventos',
      value: '89',
      change: '15 este mes',
      icon: '📅',
      color: 'orange',
      href: '/admin/eventos'
    }
  ];

  // Acciones principales simplificadas
  const quickActions = [
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios y permisos',
      icon: '�',
      color: 'blue',
      href: '/admin/users'
    },
    {
      title: 'Establecimientos',
      description: 'Supervisar establecimientos',
      icon: '🏢',
      color: 'green',
      href: '/admin/establecimientos'
    },
    {
      title: 'Reportes',
      description: 'Análisis y estadísticas',
      icon: '📊',
      color: 'purple',
      href: '/admin/stats'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: '⚙️',
      color: 'orange',
      href: '/admin/settings'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <SimpleAdminOnly fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
          <p className="text-gray-600">Solo administradores pueden acceder a esta sección</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600 text-sm sm:text-base">Control total del sistema HandicApp</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {priorityStats.map((stat, index) => (
              <Link key={index} href={stat.href}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatColorClasses(stat.color)}`}>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                ⚡
              </span>
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${getColorClasses(action.color)}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{action.icon}</span>
                      <h3 className="font-semibold">{action.title}</h3>
                    </div>
                    <p className="text-sm opacity-80">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                📊
              </span>
              Estadísticas Detalladas
            </h2>
            <StatsCards />
          </div>

          {/* System Status & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  ✅
                </span>
                Estado del Sistema
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Base de Datos', status: 'Operativa', icon: '🗄️' },
                  { name: 'API Backend', status: 'Operativa', icon: '🔗' },
                  { name: 'Servidor Web', status: 'Operativo', icon: '🌐' },
                  { name: 'Conectividad', status: 'Normal', icon: '📡' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  📢
                </span>
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                {[
                  { time: 'Hace 2 min', action: 'Nuevo usuario registrado', detail: 'Establecimiento Villa María', icon: '👤' },
                  { time: 'Hace 15 min', action: 'Evento creado', detail: 'Competencia de salto', icon: '📅' },
                  { time: 'Hace 1 hora', action: 'Caballo registrado', detail: 'Thunder - Cuarto de Milla', icon: '🐎' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg flex-shrink-0">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                        <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{activity.detail}</p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver toda la actividad →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
