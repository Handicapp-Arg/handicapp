'use client';

import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { UserManagement } from '../components/UserManagement';
import { AdminUserStats } from '../components/AdminUserStats';
import { Card } from '@/components/ui/card';
import { PageShell } from '@/components/ui/page-shell';

export default function UsersPage() {
  return (
    <SimpleAdminOnly>
      <PageShell title="Gestión de Usuarios" description="Administra los usuarios y sus roles en el sistema">
        {/* Stats Grid */}
        <AdminUserStats />

        {/* User Management Component */}
        <Card className="rounded-md">
          <UserManagement />
        </Card>
      </PageShell>
    </SimpleAdminOnly>
  );
}
