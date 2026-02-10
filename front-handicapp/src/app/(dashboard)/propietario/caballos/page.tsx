'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard/CaballoList';

export default function MisCaballosPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-2 mb-8 max-w-[1600px] mx-auto">
        <h1 className="text-[24px] font-semibold text-[#1e293b] tracking-tight">Mis Caballos</h1>
        <p className="text-slate-500 text-sm">Gestiona tu colección de caballos y monitorea su estado.</p>
      </div>
      
      <CaballoList />
    </SimpleRoleGuard>
  );
}
