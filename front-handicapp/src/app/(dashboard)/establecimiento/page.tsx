'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';

export default function EstablecimientoDashboard() {
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Panel de Establecimiento</h1>
            <p className="text-gray-600 text-sm sm:text-base">Gestiona tu establecimiento ecuestre</p>
          </div>

          {/* Estadísticas Principales */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Resumen del Establecimiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Caballos Registrados</p>
                      <p className="text-2xl font-bold text-blue-600">127</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🐎</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>15 agregados este mes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Personal Activo</p>
                      <p className="text-2xl font-bold text-green-600">23</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👨‍💼</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>5 veterinarios, 18 empleados</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Eventos Este Mes</p>
                      <p className="text-2xl font-bold text-purple-600">8</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📅</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>3 competencias, 5 entrenamientos</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                      <p className="text-2xl font-bold text-orange-600">12</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>4 urgentes, 8 normales</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Gestión del Establecimiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/establecimiento/caballos" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
                      <span className="text-xl">🐎</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Gestión de Caballos</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Registrar, editar y monitorear todos los caballos</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/establecimiento/eventos" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-purple-100 flex-shrink-0">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Eventos y Competencias</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Programar y gestionar eventos del establecimiento</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/establecimiento/tareas" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-orange-100 flex-shrink-0">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Tareas Diarias</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Organizar y asignar tareas al personal</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/establecimiento/personal" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                      <span className="text-xl">👥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Gestión de Personal</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Administrar empleados y veterinarios</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/establecimiento/configuracion" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gray-100 flex-shrink-0">
                      <span className="text-xl">⚙️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Configuración</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Ajustes del establecimiento y preferencias</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/establecimiento/reportes" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-indigo-100 flex-shrink-0">
                      <span className="text-xl">📊</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Reportes y Estadísticas</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Análisis de rendimiento del establecimiento</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Estado del Establecimiento */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Estado del Establecimiento</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <span className="text-green-500">✅</span>
                      Operaciones Diarias
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🌅</span>
                          <span className="text-sm font-medium">Alimentación Matutina</span>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Completado</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🧹</span>
                          <span className="text-sm font-medium">Limpieza de Boxes</span>
                        </div>
                        <span className="text-sm text-yellow-600 font-medium">En progreso</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🏃‍♂️</span>
                          <span className="text-sm font-medium">Ejercicio de Caballos</span>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Programado</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🌙</span>
                          <span className="text-sm font-medium">Alimentación Vespertina</span>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Pendiente</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <span className="text-blue-500">📈</span>
                      Actividad Reciente
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 py-2">
                        <span className="text-sm text-gray-500 flex-shrink-0">Hace 15 min</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Nuevo caballo registrado</p>
                          <p className="text-xs text-gray-500">Thunder - Cuarto de Milla</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2">
                        <span className="text-sm text-gray-500 flex-shrink-0">Hace 1 hora</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Tarea completada</p>
                          <p className="text-xs text-gray-500">Limpieza de establo sector A</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2">
                        <span className="text-sm text-gray-500 flex-shrink-0">Hace 2 horas</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Evento programado</p>
                          <p className="text-xs text-gray-500">Competencia de salto - Sábado</p>
                        </div>
                      </div>
                      <div className="text-center pt-4">
                        <a href="/establecimiento/actividad" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Ver toda la actividad →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
