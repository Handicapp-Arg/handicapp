'use client';

/**
 *  CONFIGURACIÓN - PROPIETARIO
 * Usa el componente reutilizable ConfiguracionLayout
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { ConfiguracionLayout } from '@/components/configuracion/ConfiguracionLayout';

export default function PropietarioConfiguracionPage() {
  return (
    <SimpleRoleGuard roles={['propietario']}>
      <ConfiguracionLayout
        role="propietario"
        availableTabs={['perfil', 'seguridad', 'notificaciones']}
        title="Configuración"
        description="Gestiona tu información personal, seguridad y preferencias"
      />
    </SimpleRoleGuard>
  );
}
