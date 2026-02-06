'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard/CaballoList';

export default function MisCaballosPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Caballos</h1>
          <p className="text-gray-600">Gestiona tu colección de caballos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <CaballoList />
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
