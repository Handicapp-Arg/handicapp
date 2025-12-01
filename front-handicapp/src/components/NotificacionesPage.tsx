'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { notificacionService } from '@/lib/services/notificacionService';

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  importante: boolean;
  url?: string;
  datos_adicionales?: any;
  usuario_id: number;
  creado_el: string;
  leido_el?: string;
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'no_leidas' | 'leidas'>('todas');
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  useEffect(() => {
    const highlightParam = searchParams?.get('highlight');

    if (highlightParam) {
      const id = Number(highlightParam);
      if (!Number.isNaN(id)) {
        setHighlightId(id);
      }
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (highlightId === null) return;

    const timeout = window.setTimeout(() => {
      setHighlightId(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [highlightId]);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionService.obtenerNotificaciones();
      setNotificaciones(data);
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
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificacionService.eliminarNotificacion(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotificaciones = notificaciones.filter(n => {
    if (filter === 'no_leidas') return !n.leida;
    if (filter === 'leidas') return n.leida;
    return true;
  });

  const stats = {
    total: notificaciones.length,
    noLeidas: notificaciones.filter(n => !n.leida).length,
    leidas: notificaciones.filter(n => n.leida).length
  };

  const getNotificationIcon = (tipo: string) => {
    if (tipo.includes('aprobada')) {
      return { emoji: '✅', bg: 'bg-green-100', text: 'text-green-600' };
    }
    if (tipo.includes('rechazada')) {
      return { emoji: '❌', bg: 'bg-red-100', text: 'text-red-600' };
    }
    if (tipo.includes('solicitud')) {
      return { emoji: 'ℹ️', bg: 'bg-blue-100', text: 'text-blue-600' };
    }
    return { emoji: 'ℹ️', bg: 'bg-blue-100', text: 'text-blue-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            🔔 Notificaciones
          </h1>
          <p className="text-gray-600">
            Mantente informado sobre eventos importantes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📬</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📩</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">No Leídas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.noLeidas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.leidas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('todas')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'todas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas ({stats.total})
              </button>
              <button
                onClick={() => setFilter('no_leidas')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'no_leidas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                No Leídas ({stats.noLeidas})
              </button>
              <button
                onClick={() => setFilter('leidas')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'leidas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Leídas ({stats.leidas})
              </button>
            </div>

            {stats.noLeidas > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ✓ Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotificaciones.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600">
                {filter === 'no_leidas' 
                  ? 'No tienes notificaciones sin leer'
                  : filter === 'leidas'
                  ? 'No tienes notificaciones leídas'
                  : 'No tienes notificaciones aún'}
              </p>
            </div>
          ) : (
            filteredNotificaciones.map((notif) => {
              const iconConfig = getNotificationIcon(notif.tipo);
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl shadow-sm border transition-all ${
                    highlightId === notif.id
                      ? 'border-blue-400 ring-2 ring-blue-200 animate-pulse'
                      : notif.leida
                      ? 'border-gray-200 opacity-75'
                      : 'border-blue-200 shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${iconConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-2xl">{iconConfig.emoji}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {notif.titulo}
                              {!notif.leida && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </h3>
                            <p className="text-gray-600">{notif.mensaje}</p>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            {!notif.leida && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Marcar como leída"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notif.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500">
                          {new Date(notif.creado_el).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
