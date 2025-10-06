'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { EventoList } from '@/components/dashboard/EventoList';

export default function VeterinarioEventosPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg shadow-sm">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🩺 Eventos Médicos
          </h1>
          <p className="text-teal-100">
            Gestiona los eventos médicos y sanitarios de los caballos bajo tu cuidado
          </p>
        </div>
      </div>

      <EventoList />
    </div>
  );
}