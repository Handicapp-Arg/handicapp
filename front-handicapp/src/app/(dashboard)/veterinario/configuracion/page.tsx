'use client';

/**
 * ⚙️ CONFIGURACIÓN - VETERINARIO
 * Usa el componente reutilizable ConfiguracionLayout
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { ConfiguracionLayout } from '@/components/configuracion/ConfiguracionLayout';

export default function VeterinarioConfiguracionPage() {
  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <ConfiguracionLayout
        role="veterinario"
        availableTabs={['perfil', 'seguridad', 'notificaciones']}
        title="Configuración"
        description="Gestiona tu información personal, seguridad y preferencias"
      />
    </SimpleRoleGuard>
  );
}
