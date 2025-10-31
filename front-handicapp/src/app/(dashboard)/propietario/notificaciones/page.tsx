'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { notificacionService } from '@/lib/services/notificacionService';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface Notificacion {
  id: number;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  leido: boolean;
  fecha_creacion: string;
}

export default function PropietarioNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'no_leidas' | 'leidas'>('todas');

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionService.obtenerNotificaciones();
      const notificacionesArray = Array.isArray(data) ? data : (data as any)?.data || [];
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
    noLeidas: notificaciones.filter(n => !n.leido).length,
    leidas: notificaciones.filter(n => n.leido).length,
    hoy: notificaciones.filter(n => {
      const today = new Date().toDateString();
      return new Date(n.fecha_creacion).toDateString() === today;
    }).length,
  }), [notificaciones]);

  const filteredNotificaciones = notificaciones.filter(n => {
    if (filter === 'no_leidas') return !n.leido;
    if (filter === 'leidas') return n.leido;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="w-8 h-8 text-blue-400" />
                  <h1 className="text-3xl font-bold text-white">Notificaciones</h1>
                </div>
                <p className="text-slate-300 text-lg">Mantente informado de las novedades</p>
              </div>
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/10"
              >
                Marcar todas como leídas
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Todas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">No Leídas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.noLeidas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Pendientes
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Leídas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.leidas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Revisadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Hoy</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.hoy}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Últimas 24h
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Lista de notificaciones</CardDescription>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="no_leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNotificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border ${notif.leido ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{notif.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.fecha_creacion).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notif.leido && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Marcar como leída"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredNotificaciones.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay notificaciones</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
