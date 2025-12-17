'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { notificacionService, type Notificacion } from '@/lib/services/notificacionService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bell, CheckCircle, Trash2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'tarea':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'recordatorio':
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    case 'caballo':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'evento':
      return <Info className="w-5 h-5 text-blue-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

const getTipoPuntoColor = (tipo: string) => {
  switch (tipo) {
    case 'tarea':
      return 'bg-green-600';
    case 'recordatorio':
      return 'bg-amber-600';
    case 'caballo':
      return 'bg-red-600';
    case 'evento':
      return 'bg-blue-600';
    default:
      return 'bg-gray-600';
  }
};

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'tarea':
      return 'bg-green-50';
    case 'recordatorio':
      return 'bg-amber-50';
    case 'caballo':
      return 'bg-red-50';
    case 'evento':
      return 'bg-blue-50';
    default:
      return 'bg-gray-50';
  }
};

export default function VeterinarioNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'no_leidas' | 'leidas'>('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionService.obtenerNotificaciones();
      const notificacionesArray = Array.isArray(data) ? data : (data as { data?: typeof data })?.data || [];
      setNotificaciones(notificacionesArray);
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificacionService.marcarComoLeida(id);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificacionService.eliminarNotificacion(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const stats = useMemo(() => ({
    total: notificaciones.length,
    noLeidas: notificaciones.filter(n => !n.leida).length,
    leidas: notificaciones.filter(n => n.leida).length,
    hoy: notificaciones.filter(n => {
      const today = new Date().toDateString();
      return new Date(n.creado_el).toDateString() === today;
    }).length,
  }), [notificaciones]);

  const filteredNotificaciones = notificaciones.filter(n => {
    if (filter === 'no_leidas') return !n.leida;
    if (filter === 'leidas') return n.leida;
    return true;
  });

  // Paginación
  const totalItems = filteredNotificaciones.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const notificacionesPaginadas = filteredNotificaciones.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Content Card */}
        <Card className="rounded-lg border border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6 pb-4">
            <div className="flex flex-col gap-4">
              {/* Título y botón */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {stats.noLeidas > 0 ? `${stats.noLeidas} sin leer` : 'Todas las notificaciones leídas'}
                  </p>
                </div>
                {stats.noLeidas > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-lg transition-all whitespace-nowrap shadow-sm"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              {/* Tabs de filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200">
                {/* Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => {
                      setFilter('todas');
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                      filter === 'todas'
                        ? 'border-[#0f172a] text-[#0f172a]'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    Todas
                    <span className={`ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
                      filter === 'todas' 
                        ? 'bg-[#0f172a]/10 text-[#0f172a]' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stats.total}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setFilter('no_leidas');
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                      filter === 'no_leidas'
                        ? 'border-[#0f172a] text-[#0f172a]'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    Sin leer
                    {stats.noLeidas > 0 && (
                      <span className={`ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full font-semibold ${
                        filter === 'no_leidas'
                          ? 'bg-[#0f172a]/10 text-[#0f172a]'
                          : 'bg-[#0f172a]/10 text-[#0f172a]'
                      }`}>
                        {stats.noLeidas}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFilter('leidas');
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                      filter === 'leidas'
                        ? 'border-[#0f172a] text-[#0f172a]'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    Leídas
                    <span className={`ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
                      filter === 'leidas'
                        ? 'bg-[#0f172a]/10 text-[#0f172a]'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stats.leidas}
                    </span>
                  </button>
                </div>

                {/* Selector de items por página */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 pb-2">
                  <span className="hidden sm:inline">Mostrar</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-[#0f172a] bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs sm:text-sm">reg.</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2">
              {notificacionesPaginadas.map((notif) => (
                <div
                  key={notif.id}
                  className={`group relative rounded-lg border transition-all duration-200 ${
                    !notif.leida 
                      ? 'bg-gradient-to-r from-[#0f172a]/5 to-transparent border-[#0f172a]/20 hover:border-[#0f172a]/40 hover:shadow-md' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="p-4 flex gap-3">
                    {/* Indicador de no leído (más pequeño) */}
                    <div className="flex-shrink-0 pt-1.5">
                      {!notif.leida && (
                        <div className={`w-1.5 h-1.5 rounded-full ${getTipoPuntoColor(notif.tipo)}`}></div>
                      )}
                    </div>

                    {/* Icono del tipo */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getTipoColor(notif.tipo)} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      {getTipoIcon(notif.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold leading-tight ${!notif.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notif.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                            {notif.mensaje}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notif.creado_el).toLocaleString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Acciones (aparecen en hover) */}
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.leida && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="p-2 rounded-lg hover:bg-[#0f172a]/10 text-[#0f172a] transition-all hover:scale-110"
                              title="Marcar como leída"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all hover:scale-110"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredNotificaciones.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No hay notificaciones</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {filter === 'no_leidas' ? 'Todas las notificaciones están leídas' : 'Cuando recibas notificaciones aparecerán aquí'}
                  </p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {filteredNotificaciones.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                  <span className="font-medium">{totalItems}</span> notificaciones
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-8 h-8 text-sm rounded-lg transition-all ${
                            currentPage === pageNumber
                              ? 'bg-[#0f172a] text-white shadow-sm'
                              : 'border border-gray-300 hover:bg-gray-50 hover:border-[#0f172a]/30'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
