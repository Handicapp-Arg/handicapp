'use client';

/**
 *  CONFIGURACIÓN - PROPIETARIO
 * Usa el componente reutilizable ConfiguracionLayout
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { ConfiguracionLayout } from '@/components/settings/SettingsLayout';

export default function PropietarioConfiguracionPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <ConfiguracionLayout
        role="propietario"
        availableTabs={['perfil', 'seguridad']}
        title="Configuración"
        description="Gestiona tu información personal y seguridad"
      />
    </SimpleRoleGuard>
  );
}
