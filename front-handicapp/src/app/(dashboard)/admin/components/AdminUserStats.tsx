'use client';

import { useState, useEffect } from 'react';
import { UserStatsCards } from '@/components/common/UserManagement';
import { Shield } from 'lucide-react';
import ApiClient from '@/lib/services/apiClient';

export function AdminUserStats() {
  const [stats, setStats] = useState({ total: 0, activos: 0, roles: 0, nuevos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users para contar
        const usersData = await ApiClient.getUsers(1, 1000);
        const usersArray = (usersData as any).data?.users || [];
        const activos = usersArray.filter((u: any) => u.estado_usuario === 'active').length;
        
        // Fetch roles
        const rolesData = await ApiClient.getRoles();
        const rolesArray = (rolesData as any).data.roles || [];
        
        setStats({
          total: usersArray.length,
          activos,
          roles: rolesArray.length,
          nuevos: 0, // TODO: calcular nuevos del mes
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <UserStatsCards
      total={stats.total}
      activos={stats.activos}
      metric3={stats.roles}
      nuevos={stats.nuevos}
      metric3Label="Roles Disponibles"
      metric3Icon={Shield}
      metric3Badge={stats.roles === 0 ? 'Sin roles' : stats.roles === 1 ? '1 Rol' : `${stats.roles} Roles`}
      primaryColor="#0f172a"
    />
  );
}
