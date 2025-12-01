'use client';

import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { UserManagement } from '../components/UserManagement';
import { AdminUserStats } from '../components/AdminUserStats';
import { Card } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <SimpleAdminOnly>
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <AdminUserStats />

        {/* User Management Component */}
        <Card className="rounded-xl sm:rounded-2xl shadow-xl">
          <UserManagement />
        </Card>
      </div>
    </SimpleAdminOnly>
  );
}
