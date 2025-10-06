'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { CaballoList } from '@/components/dashboard/CaballoList';

export default function CaballosPage() {
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-sm">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestión de Caballos
          </h1>
          <p className="text-green-100">
            Registra, edita y supervisa todos los caballos del sistema
          </p>
        </div>
      </div>

      <CaballoList />
    </div>
  );
}