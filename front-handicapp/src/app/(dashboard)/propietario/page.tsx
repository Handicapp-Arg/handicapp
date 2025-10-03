'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';

export default function PropietarioDashboard() {
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Panel de Propietario</h1>
            <p className="text-gray-600 text-sm sm:text-base">Gestiona y monitorea tus caballos</p>
          </div>

          {/* Estadísticas Principales */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Mis Caballos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Caballos Registrados</p>
                      <p className="text-2xl font-bold text-blue-600">7</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🐎</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>5 en entrenamiento, 2 en descanso</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Competencias Este Mes</p>
                      <p className="text-2xl font-bold text-green-600">3</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>2 programadas, 1 finalizada</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Consultas Veterinarias</p>
                      <p className="text-2xl font-bold text-purple-600">12</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🩺</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>2 este mes, 10 anteriores</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estado de Salud</p>
                      <p className="text-2xl font-bold text-green-600">Excelente</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">❤️</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Todos los caballos sanos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Gestión de Caballos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/propietario/caballos" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
                      <span className="text-xl">🐎</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Mis Caballos</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Ver información detallada de mis caballos</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/propietario/salud" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-purple-100 flex-shrink-0">
                      <span className="text-xl">🩺</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Salud y Veterinaria</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Historial médico y citas veterinarias</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/propietario/competencias" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                      <span className="text-xl">🏆</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Competencias</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Inscribir y gestionar competencias</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/propietario/entrenamiento" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-orange-100 flex-shrink-0">
                      <span className="text-xl">🏃‍♂️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Plan de Entrenamiento</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Seguimiento de entrenamientos y progreso</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/propietario/reportes" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-indigo-100 flex-shrink-0">
                      <span className="text-xl">📊</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Reportes y Estadísticas</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Análisis de rendimiento de mis caballos</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </a>

                <a href="/propietario/configuracion" className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 cursor-pointer hover:scale-[1.02] hover:border-gray-200 block">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gray-100 flex-shrink-0">
                      <span className="text-xl">⚙️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Configuración</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">Ajustes de cuenta y preferencias</p>
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
