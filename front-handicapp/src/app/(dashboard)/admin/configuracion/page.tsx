'use client';

/**
 *  CONFIGURACIÓN - ADMINISTRADOR
 * Usa el componente reutilizable ConfiguracionLayout
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { ConfiguracionLayout } from '@/components/configuracion/ConfiguracionLayout';

export default function AdminConfiguracionPage() {
  return (
    <SimpleRoleGuard roles={['admin']}>
      <ConfiguracionLayout
        role="admin"
        availableTabs={['perfil', 'seguridad']}
        title="Configuración"
        description="Gestiona tu información personal y seguridad"
      />
    </SimpleRoleGuard>
  );
}
