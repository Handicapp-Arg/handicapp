'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';

export default function VeterinarioDashboard() {
  return (
    <SimpleRoleGuard roles={['veterinario']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo veterinarios pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Panel Veterinario</h1>
            <p className="text-gray-600 text-sm sm:text-base">Gestiona la salud y bienestar de los caballos</p>
          </div>

          {/* Estadísticas Principales */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Resumen Médico</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pacientes en Tratamiento</p>
                      <p className="text-2xl font-bold text-red-600">34</p>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏥</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>12 casos críticos</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Consultas Hoy</p>
                      <p className="text-2xl font-bold text-blue-600">8</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🩺</span>
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
                      <p className="text-sm font-medium text-gray-600">Emergencias</p>
                      <p className="text-2xl font-bold text-orange-600">3</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🚨</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>2 atendidas, 1 en curso</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tratamientos Activos</p>
                      <p className="text-2xl font-bold text-green-600">47</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💊</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>15 antibióticos, 32 preventivos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Área Veterinaria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/veterinario/consultas" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
                      <span className="text-xl">🩺</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Consultas y Diagnósticos</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Registrar consultas y realizar diagnósticos</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/veterinario/tratamientos" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                      <span className="text-xl">💊</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Gestión de Tratamientos</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Medicamentos y seguimiento de terapias</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/veterinario/historiales" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-purple-100 flex-shrink-0">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Historial Médico</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Acceder a registros médicos completos</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/veterinario/calendario" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-indigo-100 flex-shrink-0">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Calendario de Citas</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Programar y gestionar citas veterinarias</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/veterinario/emergencias" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-red-100 flex-shrink-0">
                      <span className="text-xl">🚨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Emergencias</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Atención inmediata de casos urgentes</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/veterinario/reportes" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-yellow-100 flex-shrink-0">
                      <span className="text-xl">📊</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Reportes Médicos</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Informes y estadísticas veterinarias</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Estado de la Práctica */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Estado de la Práctica</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <span className="text-red-500">🏥</span>
                      Casos Prioritarios
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🐎</span>
                          <div>
                            <span className="text-sm font-medium">Thunder - Cólico</span>
                            <p className="text-xs text-gray-500">Establecimiento Villa María</p>
                          </div>
                        </div>
                        <span className="text-sm text-red-600 font-medium">Urgente</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🐎</span>
                          <div>
                            <span className="text-sm font-medium">Lightning - Fractura</span>
                            <p className="text-xs text-gray-500">Establecimiento San Carlos</p>
                          </div>
                        </div>
                        <span className="text-sm text-orange-600 font-medium">Alto</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🐎</span>
                          <div>
                            <span className="text-sm font-medium">Spirit - Control</span>
                            <p className="text-xs text-gray-500">Establecimiento Los Alamos</p>
                          </div>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Normal</span>
                      </div>
                      <div className="text-center pt-4">
                        <a href="/veterinario/casos" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Ver todos los casos →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <span className="text-blue-500">📋</span>
                      Actividad Reciente
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 py-2">
                        <span className="text-sm text-gray-500 flex-shrink-0">Hace 10 min</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Consulta completada</p>
                          <p className="text-xs text-gray-500">Thunder - Revisión post-cirugía</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2">
                        <span className="text-sm text-gray-500 flex-shrink-0">Hace 45 min</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Tratamiento iniciado</p>
                          <p className="text-xs text-gray-500">Storm - Antibiótico preventivo</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2">
                        <span className="text-sm text-gray-500 flex-shrink-0">Hace 2 horas</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Emergencia atendida</p>
                          <p className="text-xs text-gray-500">Blade - Lesión en la pata</p>
                        </div>
                      </div>
                      <div className="text-center pt-4">
                        <a href="/veterinario/actividad" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
