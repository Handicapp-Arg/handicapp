'use client';

import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { UserManagement } from '../components/UserManagement';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserCheck, Shield, UserCog, Activity } from 'lucide-react';
import Link from 'next/link';
import { useStats } from '@/lib/hooks/useStats';

export default function UsersPage() {
  const { stats } = useStats();

  return (
    <SimpleAdminOnly>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Moderno */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl shadow-2xl mb-6 p-8">
          {/* Pattern de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>
          
          {/* Gradient orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                  Gestión de Usuarios
                </h1>
                <p className="text-sm sm:text-base text-white/70 mt-1">
                  Panel completo para administrar usuarios, roles y permisos del sistema
                </p>
              </div>
            </div>
            
            {/* Stats Grid Compacto */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {/* Total Usuarios */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-300" />
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    Total
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {(stats as any).empleados?.total || 0}
                </p>
                <p className="text-xs text-white/60 mt-1">Usuarios registrados</p>
              </div>

              {/* Activos */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="w-5 h-5 text-green-300" />
                  <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs">
                    Activos
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {(stats as any).empleados?.activos || 0}
                </p>
                <p className="text-xs text-white/60 mt-1">Con acceso al sistema</p>
              </div>

              {/* Con Roles */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-purple-300" />
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                    Roles
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {(stats as any).empleados?.total || 0}
                </p>
                <p className="text-xs text-white/60 mt-1">Con roles asignados</p>
              </div>

              {/* Nuevos este mes */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-amber-300" />
                  <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs">
                    Nuevos
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {(stats as any).usuarios?.nuevos || 12}
                </p>
                <p className="text-xs text-white/60 mt-1">Últimos 30 días</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Component */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <UserManagement />
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
