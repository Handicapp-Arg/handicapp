'use client';

import React, { useState, useEffect } from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { auditoriaService, type AuditoriaLog, type AuditoriaFilters } from '@/lib/services/auditoriaService';
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AuditoriaPage() {
  const [auditorias, setAuditorias] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState<AuditoriaFilters>({
    page: 1,
    limit: 50
  });
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [dateRange, setDateRange] = useState({ inicio: '', fin: '' });
  
  // Filter options
  const [actions, setActions] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1
  });

  // Selected log for modal
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAuditorias();
    fetchStats();
    fetchFilterOptions();
  }, [filters]);

  const fetchAuditorias = async () => {
    try {
      setLoading(true);
      const response = await auditoriaService.getAuditorias(filters);
      setAuditorias(response.auditorias);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching auditorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await auditoriaService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [actionsData, typesData] = await Promise.all([
        auditoriaService.getActions(),
        auditoriaService.getEntityTypes()
      ]);
      setActions(actionsData);
      setEntityTypes(typesData);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }));
  };

  const handleFilterChange = () => {
    setFilters(prev => ({
      ...prev,
      accion: selectedAction || undefined,
      entidad_tipo: selectedEntityType || undefined,
      fecha_inicio: dateRange.inicio || undefined,
      fecha_fin: dateRange.fin || undefined,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedAction('');
    setSelectedEntityType('');
    setDateRange({ inicio: '', fin: '' });
    setFilters({ page: 1, limit: 50 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openLogDetails = (log: AuditoriaLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setShowModal(false);
  };

  return (
    <SimpleAdminOnly>
      <div className="min-h-screen bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Auditoría del Sistema</h1>
            <p className="text-gray-600 text-sm sm:text-base">Registro completo de actividad y acciones en el sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registros</p>
                  <p className="text-2xl font-bold text-blue-600">{statsLoading ? '...' : stats?.total?.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Desde el inicio</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Últimas 24h</p>
                  <p className="text-2xl font-bold text-green-600">{statsLoading ? '...' : stats?.last24h?.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Actividad reciente</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Última Semana</p>
                  <p className="text-2xl font-bold text-purple-600">{statsLoading ? '...' : stats?.last7days?.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">7 días</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Último Mes</p>
                  <p className="text-2xl font-bold text-orange-600">{statsLoading ? '...' : stats?.last30days?.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📆</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">30 días</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las acciones</option>
                {actions.map(action => (
                  <option key={action} value={action}>
                    {auditoriaService.formatAction(action)}
                  </option>
                ))}
              </select>

              {/* Entity Type Filter */}
              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>
                    {auditoriaService.formatEntityType(type)}
                  </option>
                ))}
              </select>

              {/* Date Range */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.inicio}
                  onChange={(e) => setDateRange(prev => ({ ...prev, inicio: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={dateRange.fin}
                  onChange={(e) => setDateRange(prev => ({ ...prev, fin: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Hasta"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFilterChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Aplicar Filtros
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : auditorias.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-600">No se encontraron registros de auditoría</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditorias.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(log.creado_el)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {log.actor_usuario ? `${log.actor_usuario.nombre} ${log.actor_usuario.apellido}` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{log.actor_usuario?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${auditoriaService.getActionColor(log.accion)}`}>
                            <span>{auditoriaService.getActionIcon(log.accion)}</span>
                            {auditoriaService.formatAction(log.accion)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.entidad_tipo ? (
                            <div>
                              <div className="font-medium">{auditoriaService.formatEntityType(log.entidad_tipo)}</div>
                              {log.entidad_id && <div className="text-gray-500 text-xs">ID: {log.entidad_id}</div>}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openLogDetails(log)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && auditorias.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                      <span className="font-medium">{pagination.total}</span> registros
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ←
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        →
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Actions and Users */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Top Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Acciones Más Frecuentes
                </h3>
                <div className="space-y-3">
                  {stats.topActions.slice(0, 5).map((action: any, index: number) => (
                    <div key={action.accion} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${auditoriaService.getActionColor(action.accion)}`}>
                          {auditoriaService.formatAction(action.accion)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{action.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Users */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👥</span>
                  Usuarios Más Activos
                </h3>
                <div className="space-y-3">
                  {stats.topUsers.slice(0, 5).map((user: any, index: number) => (
                    <div key={user.actor_usuario_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.actor_usuario.nombre} {user.actor_usuario.apellido}
                          </div>
                          <div className="text-xs text-gray-500">{user.actor_usuario.email}</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{user.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Detalles del Registro</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="text-gray-900 mt-1">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha y Hora</label>
                  <p className="text-gray-900 mt-1">{formatDate(selectedLog.creado_el)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Usuario</label>
                <p className="text-gray-900 mt-1">
                  {selectedLog.actor_usuario 
                    ? `${selectedLog.actor_usuario.nombre} ${selectedLog.actor_usuario.apellido} (${selectedLog.actor_usuario.email})`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Acción</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${auditoriaService.getActionColor(selectedLog.accion)}`}>
                    <span>{auditoriaService.getActionIcon(selectedLog.accion)}</span>
                    {auditoriaService.formatAction(selectedLog.accion)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de Entidad</label>
                  <p className="text-gray-900 mt-1">
                    {selectedLog.entidad_tipo ? auditoriaService.formatEntityType(selectedLog.entidad_tipo) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ID de Entidad</label>
                  <p className="text-gray-900 mt-1">{selectedLog.entidad_id || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Dirección IP</label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">{selectedLog.ip || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User Agent</label>
                  <p className="text-gray-900 mt-1 text-sm truncate" title={selectedLog.user_agent || ''}>
                    {selectedLog.user_agent || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedLog.metadatos_json && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Metadatos</label>
                  <pre className="mt-1 bg-gray-50 rounded-lg p-4 text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.metadatos_json), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </SimpleAdminOnly>
  );
}
