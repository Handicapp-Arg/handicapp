'use client';

import { useState, useEffect } from 'react';
import ApiClient from '@/lib/services/apiClient';


interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  roleDistribution: {
    [key: string]: number;
  };
  recentUsers: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getUserStats();
      setStats((data as any).data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      // No redirigir, solo mostrar error en UI
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar estadísticas</h2>
        <p className="text-gray-600">No se pudieron cargar las estadísticas del sistema.</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const roleNames: Record<string, string> = {
    admin: 'Administradores',
    establecimiento: 'Establecimientos',
    capataz: 'Capataces',
    veterinario: 'Veterinarios',
    empleado: 'Empleados',
    propietario: 'Propietarios',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    establecimiento: 'bg-blue-100 text-blue-800 border-blue-200',
    capataz: 'bg-green-100 text-green-800 border-green-200',
    veterinario: 'bg-purple-100 text-purple-800 border-purple-200',
    empleado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    propietario: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const inactivePercentage = stats.totalUsers > 0 ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100) : 0;
  const verifiedPercentage = stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm text-gray-600">
              <span>{100 - inactivePercentage}% del total</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚫</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm text-gray-600">
              <span>{inactivePercentage}% del total</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verificados</p>
              <p className="text-2xl font-bold text-blue-600">{stats.verifiedUsers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm text-gray-600">
              <span>{verifiedPercentage}% del total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Roles</h3>
        
        {Object.keys(stats.roleDistribution).length === 0 ? (
          <p className="text-gray-600">No hay datos de distribución de roles disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.roleDistribution).map(([roleKey, count]) => {
              const percentage = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
              
              return (
                <div
                  key={roleKey}
                  className={`p-4 rounded-lg border ${roleColors[roleKey] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{roleNames[roleKey] || roleKey}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <div className="text-sm opacity-75">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">🆕</div>
            <p className="text-2xl font-bold text-gray-900">{stats.recentUsers}</p>
            <p className="text-sm text-gray-600">Usuarios últimos 7 días</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-gray-600">Total acumulado</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-2xl font-bold text-gray-900">{Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}%</p>
            <p className="text-sm text-gray-600">Tasa de actividad</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchStats}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
}