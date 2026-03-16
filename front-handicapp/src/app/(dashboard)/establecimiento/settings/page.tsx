'use client';

/**
 *  CONFIGURACIÓN - ESTABLECIMIENTO
 * Usa el componente reutilizable ConfiguracionLayout
 * Incluye gestión de datos del establecimiento
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { ConfiguracionLayout } from '@/components/settings/SettingsLayout';

export default function EstablecimientoConfiguracionPage() {
  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <ConfiguracionLayout
        role="establecimiento"
        availableTabs={['establecimiento', 'perfil', 'seguridad']}
        hasEstablecimiento={true}
        title="Configuración"
        description="Gestiona la información de tu establecimiento y tu cuenta"
      />
    </SimpleRoleGuard>
  );
}
