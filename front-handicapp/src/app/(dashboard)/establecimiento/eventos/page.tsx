'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { EventoList } from '@/components/dashboard';

export default function EstablecimientoEventosPage() {
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos del Establecimiento</h1>
          <p className="text-gray-600">Gestiona los eventos de tu establecimiento</p>
        </div>
        
        <EventoList />
      </div>
    </SimpleRoleGuard>
  );
}