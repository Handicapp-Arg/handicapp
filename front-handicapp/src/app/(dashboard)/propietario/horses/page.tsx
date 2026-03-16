'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { CaballoList } from '@/components/dashboard/CaballoList';
import { PageShell } from '@/components/ui/page-shell';

export default function MisCaballosPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <PageShell title="Mis Caballos" description="Gestiona y visualiza todos tus caballos registrados">
        <CaballoList />
      </PageShell>
    </SimpleRoleGuard>
  );
}
