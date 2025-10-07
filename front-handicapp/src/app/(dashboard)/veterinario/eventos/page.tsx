'use client';

import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { EventoList } from '@/components/dashboard/EventoList';

export default function VeterinarioEventosPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🩺 Eventos Médicos</h1>
          <p className="text-gray-600 text-sm sm:text-base">Gestiona los eventos médicos y sanitarios de los caballos bajo tu cuidado</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-teal-600">-</p>
              </div>
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🩺</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Eventos médicos</span>
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
                <span>Atención inmediata</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programados</p>
                <p className="text-2xl font-bold text-blue-600">-</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Próximos eventos</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">-</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Finalizados</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Componente de gestión */}
        <div className="bg-white rounded-lg shadow">
          <EventoList />
        </div>
      </div>
    </div>
  );
}