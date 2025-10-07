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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiClient.getUserStats();
      setStats((data as any).data || data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      
      // Si es error de autenticación, no reintentar
      if (error.message?.includes('autorizado') || error.message?.includes('Sesión expirada')) {
        setError('No tienes permisos para ver estas estadísticas');
        setStats(null);
        return;
      }
      
      // Reintentar hasta 2 veces en caso de error de servidor
      if (retryCount < 2) {
        console.log(`Reintentando obtener estadísticas (intento ${retryCount + 1}/2)`);
        setTimeout(() => fetchStats(retryCount + 1), 1000);
        return;
      }
      
      setError('Error al cargar las estadísticas. Inténtalo más tarde.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar estadísticas</h2>
        <p className="text-gray-600 mb-4">{error || 'No se pudieron cargar las estadísticas del sistema.'}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔄 Reintentar
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
      {/* Main Stats Cards - Más compactas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Usuarios registrados</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{100 - inactivePercentage}% del total</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">✓</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Verificados</p>
              <p className="text-2xl font-bold text-blue-600">{stats.verifiedUsers}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{verifiedPercentage}% verificados</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🆕</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Nuevos</p>
              <p className="text-2xl font-bold text-orange-600">{stats.recentUsers}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Últimos 7 días</p>
        </div>
      </div>

      {/* Role Distribution - Más compacta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
            🎭
          </span>
          Distribución por Roles
        </h3>
        
        {Object.keys(stats.roleDistribution).length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-gray-600">No hay datos de distribución disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(stats.roleDistribution).map(([roleKey, count]) => {
              const percentage = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
              
              return (
                <div
                  key={roleKey}
                  className={`p-4 rounded-lg border-2 ${roleColors[roleKey] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{roleNames[roleKey] || roleKey}</p>
                      <p className="text-xl font-bold">{count}</p>
                    </div>
                    <div className="text-sm font-medium opacity-75">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compact Activity Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
            📈
          </span>
          Métricas de Actividad
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-2xl font-bold text-blue-700">{Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}%</p>
            <p className="text-sm text-blue-600 font-medium">Tasa de Actividad</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-2xl font-bold text-green-700">{stats.recentUsers}</p>
            <p className="text-sm text-green-600 font-medium">Nuevos (7 días)</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-2xl font-bold text-purple-700">{verifiedPercentage}%</p>
            <p className="text-sm text-purple-600 font-medium">Verificación</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
        >
          <span>🔄</span>
          Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
}