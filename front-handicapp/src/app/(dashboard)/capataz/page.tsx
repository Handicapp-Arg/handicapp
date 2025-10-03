'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';

export default function CapatazDashboard() {
  return (
    <SimpleRoleGuard roles={['capataz']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo capataces pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Panel de Capataz</h1>
            <p className="text-gray-600 text-sm sm:text-base">Supervisa las operaciones diarias del establecimiento</p>
          </div>

          {/* Estadísticas Principales */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Operaciones del Día</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Empleados Trabajando</p>
                      <p className="text-2xl font-bold text-green-600">18</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👷</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>2 ausentes hoy</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                      <p className="text-2xl font-bold text-blue-600">24</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>de 30 programadas</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Caballos Atendidos</p>
                      <p className="text-2xl font-bold text-purple-600">85</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🐎</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Alimentación y cuidado</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Incidencias</p>
                      <p className="text-2xl font-bold text-orange-600">2</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>1 resuelta, 1 pendiente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Supervisión y Control</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/capataz/personal" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                      <span className="text-xl">👥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Control de Personal</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Gestionar horarios y asistencia del equipo</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/capataz/tareas" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Asignación de Tareas</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Distribuir y supervisar tareas diarias</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/capataz/reportes" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-purple-100 flex-shrink-0">
                      <span className="text-xl">📊</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Reportes Operativos</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Informes de productividad y rendimiento</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
