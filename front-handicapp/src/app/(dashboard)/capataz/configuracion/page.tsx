'use client';

/**
 *  CONFIGURACIÓN - CAPATAZ
 * Usa el componente reutilizable ConfiguracionLayout
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { ConfiguracionLayout } from '@/components/configuracion/ConfiguracionLayout';

export default function CapatazConfiguracionPage() {
  return (
    <SimpleRoleGuard roles={['capataz']}>
      <ConfiguracionLayout
        role="capataz"
        availableTabs={['perfil', 'seguridad', 'notificaciones']}
        title="Configuración"
        description="Gestiona tu información personal, seguridad y preferencias"
      />
    </SimpleRoleGuard>
  );
}
