'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { PageHeader } from '@/components/ui/page-header';
import { CaballoList } from '@/components/dashboard/CaballoList';
import { Heart } from 'lucide-react';

export default function MisCaballosPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="max-w-[1600px] mx-auto">
        <PageHeader
          title="Mis Caballos"
          subtitle="Gestiona tu colección de caballos y monitorea su estado."
        />
        <CaballoList />
      </div>
    </SimpleRoleGuard>
  );
}
