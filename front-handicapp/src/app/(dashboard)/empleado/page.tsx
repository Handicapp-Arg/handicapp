'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';

export default function EmpleadoDashboard() {
  return (
    <SimpleRoleGuard roles={['empleado']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo empleados pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Panel de Empleado</h1>
            <p className="text-gray-600 text-sm sm:text-base">Gestiona tus tareas y responsabilidades diarias</p>
          </div>

          {/* Estadísticas Principales */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Mi Jornada de Trabajo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tareas Asignadas</p>
                      <p className="text-2xl font-bold text-blue-600">8</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>6 completadas, 2 pendientes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Caballos Asignados</p>
                      <p className="text-2xl font-bold text-green-600">12</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🐎</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Sector A y B</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Horas Trabajadas</p>
                      <p className="text-2xl font-bold text-purple-600">6.5</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>de 8 horas programadas</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                      <p className="text-2xl font-bold text-orange-600">92%</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>+5% desde la semana pasada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Área de Trabajo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/empleado/tareas" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Mis Tareas</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Ver y actualizar el estado de mis tareas</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/empleado/caballos" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                      <span className="text-xl">🐎</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Cuidado de Caballos</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Registrar alimentación y cuidados</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/empleado/horarios" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-purple-100 flex-shrink-0">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Mi Horario</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Consultar horarios y turnos asignados</p>
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
