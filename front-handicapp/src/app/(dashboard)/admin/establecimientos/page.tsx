'use client';

import React, { useState } from 'react';
import { EstablecimientoList } from '@/components/dashboard/EstablecimientoList';
import { EstablecimientoForm } from '@/components/dashboard/EstablecimientoForm';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { type Establecimiento } from '@/lib/services/establecimientoService';

export default function AdminEstablecimientosPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<Establecimiento | null>(null);

  const handleCreateNew = () => {
    setSelectedEstablecimiento(null);
    setView('create');
  };

  const handleEdit = (establecimiento: Establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
    setView('edit');
  };

  const handleSave = (establecimiento: Establecimiento) => {
    setView('list');
    setSelectedEstablecimiento(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedEstablecimiento(null);
  };

  const handleSelect = (establecimiento: Establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
  };

  if (view === 'create') {
    return (
      <SimpleAdminOnly>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <EstablecimientoForm
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </SimpleAdminOnly>
    );
  }

  if (view === 'edit' && selectedEstablecimiento) {
    return (
      <SimpleAdminOnly>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <EstablecimientoForm
              establecimiento={selectedEstablecimiento}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </SimpleAdminOnly>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gestión de Establecimientos</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra establecimientos ecuestres y sus configuraciones</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Establecimientos</p>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>+3 este mes</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Establecimientos Activos</p>
                <p className="text-2xl font-bold text-green-600">22</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>92% operativos</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Caballos</p>
                <p className="text-2xl font-bold text-purple-600">1,847</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🐎</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Registrados en total</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Caballos</p>
                <p className="text-2xl font-bold text-orange-600">77</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <span>Por establecimiento</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Componente de lista */}
        <div className="bg-white rounded-lg shadow">
          <EstablecimientoList
            onCreateEstablecimiento={handleCreateNew}
            onEditEstablecimiento={handleEdit}
            onSelectEstablecimiento={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}