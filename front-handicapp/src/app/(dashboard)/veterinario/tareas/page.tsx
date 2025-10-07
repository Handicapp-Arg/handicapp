'use client';

import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { TareaList } from '@/components/dashboard/TareaList';

export default function VeterinarioTareasPage() {
  const { user, isLoading } = useAuthNew();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📋 Tareas Veterinarias</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra las tareas médicas y de cuidado asignadas</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold text-green-600">-</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Todas las tareas</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">-</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Prioridad alta</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-blue-600">-</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Para hoy</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-emerald-600">-</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Finalizadas</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Componente de gestión */}
        <div className="bg-white rounded-lg shadow">
          <TareaList />
        </div>
      </div>
    </div>
  );
}