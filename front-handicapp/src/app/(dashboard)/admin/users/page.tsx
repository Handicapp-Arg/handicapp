'use client';

import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { UserManagement } from '../components/UserManagement';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  return (
    <SimpleAdminOnly>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header compacto */}
        <div className="bg-[#0f172a] rounded-2xl shadow-xl mb-6 px-6 sm:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-sm text-white/70">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
        </div>

        {/* User Management Component */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <UserManagement />
        </div>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
