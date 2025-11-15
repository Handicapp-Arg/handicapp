'use client';

import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { UserManagement } from '../components/UserManagement';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserCheck, Shield, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ApiClient from '@/lib/services/apiClient';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  recentUsers: number;
  roleDistribution: Record<string, number>;
}

export default function UsersPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const response = await ApiClient.getUserStats();
        const statsData = (response as any).data;
        if (statsData) {
          setUserStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <SimpleAdminOnly>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section con Stats Integrados */}
        <div className="relative overflow-hidden mb-8 rounded-2xl">
          {/* Background oscuro */}
          <div className="absolute inset-0 bg-[#0f172a]"></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
          
          {/* Gradient orbs - Slate para admin */}
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-slate-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gray-500/20 rounded-full blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-6">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                  Gestión de Usuarios
                </h1>
                <p className="text-sm sm:text-base text-white/70">
                  Administra usuarios, roles y permisos del sistema
                </p>
              </div>
              <Link
                href="/admin/users/nuevo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-5 h-5" />
                Nuevo Usuario
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Stat 1 - Total */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                      Total Usuarios
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-slate-500/20">
                      <Users className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {loading ? '...' : (userStats?.totalUsers || 0)}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Registrados
                  </Badge>
                </CardContent>
              </Card>

              {/* Stat 2 - Activos */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-green-300 uppercase tracking-wider">
                      Activos
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-green-500/20">
                      <UserCheck className="w-3 h-3 text-green-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {loading ? '...' : (userStats?.activeUsers || 0)}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Verificados: {loading ? '...' : (userStats?.verifiedUsers || 0)}
                  </Badge>
                </CardContent>
              </Card>

              {/* Stat 3 - Roles */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
                      Roles
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                      <Shield className="w-3 h-3 text-blue-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">6</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Configurados
                  </Badge>
                </CardContent>
              </Card>

              {/* Stat 4 - Nuevos */}
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                      Nuevos
                    </CardDescription>
                    <div className="p-1.5 rounded-lg bg-amber-500/20">
                      <UserCog className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {loading ? '...' : (userStats?.recentUsers || 0)}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-white/10 text-white/80 border-white/20">
                    Últimos 7 días
                  </Badge>
                </CardContent>
              </Card>
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
