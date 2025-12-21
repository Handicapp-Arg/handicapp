'use client';

/**
 *  CONFIGURACIÓN - EMPLEADO
 * Usa el componente reutilizable ConfiguracionLayout
 */

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { ConfiguracionLayout } from '@/components/configuracion/ConfiguracionLayout';

export default function EmpleadoConfiguracionPage() {
  return (
    <SimpleRoleGuard roles={['empleado']}>
      <ConfiguracionLayout
        role="empleado"
        availableTabs={['perfil', 'seguridad', 'notificaciones']}
        title="Configuración"
        description="Gestiona tu información personal, seguridad y preferencias"
      />
    </SimpleRoleGuard>
  );
}
