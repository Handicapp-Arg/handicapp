'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { TareaList } from '@/components/dashboard/TareaList';

export default function PropietarioTareasPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <TareaList />
    </SimpleRoleGuard>
  );
}
