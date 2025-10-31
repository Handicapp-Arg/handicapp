'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  Mail,
  Smartphone,
  Calendar,
  Trophy,
  Settings,
  Circle,
  Trash2,
  Filter,
  Loader2,
  Check
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { useNotificationContext } from '@/components/providers/NotificationProvider';

type FiltroEstado = 'todas' | 'no-leidas' | 'leidas';
type FiltroTipo = 'todas' | 'evento' | 'tarea' | 'caballo' | 'sistema' | 'recordatorio';

export default function NotificacionesContent() {
  // Usar el contexto de notificaciones con WebSocket
  const {
    notificaciones,
    stats,
    loading,
    isConnected,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    eliminarLeidas,
  } = useNotificationContext();

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todas');

  // Configuración de preferencias
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Handlers con confirmación
  const handleEliminarNotificacion = async (id: number) => {
    if (!confirm('¿Eliminar esta notificación?')) return;
    await eliminarNotificacion(id);
  };

  const handleEliminarLeidas = async () => {
    if (!confirm('¿Eliminar todas las notificaciones leídas?')) return;
    await eliminarLeidas();
  };

  const notificacionesFiltradas = Array.isArray(notificaciones) 
    ? notificaciones.filter(n => {
        const matchEstado = 
          filtroEstado === 'todas' || 
          (filtroEstado === 'no-leidas' && !n.leida) ||
          (filtroEstado === 'leidas' && n.leida);
        
        const matchTipo = filtroTipo === 'todas' || n.tipo === filtroTipo;
        
        return matchEstado && matchTipo;
      })
    : [];

  const getIconoTipo = (tipo: string) => {
    const iconos: Record<string, React.ElementType> = {
      evento: Calendar,
      tarea: CheckCheck,
      caballo: Trophy,
      sistema: Settings,
      recordatorio: Bell,
    };
    return iconos[tipo] || Bell;
  };

  const getColorTipo = (tipo: string) => {
    const colores: Record<string, { bg: string; text: string; icon: string }> = {
      evento: { bg: 'from-blue-100 to-blue-200 border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
      tarea: { bg: 'from-green-100 to-green-200 border-green-200', text: 'text-green-700', icon: 'text-green-600' },
      caballo: { bg: 'from-purple-100 to-purple-200 border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
      sistema: { bg: 'from-gray-100 to-gray-200 border-gray-200', text: 'text-gray-700', icon: 'text-gray-600' },
      recordatorio: { bg: 'from-amber-100 to-amber-200 border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' },
    };
    return colores[tipo] || colores.sistema;
  };

  const formatearTiempo = (fecha: string) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotif.getTime();
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `Hace ${diffMinutos} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
    return fechaNotif.toLocaleDateString('es-AR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Notificaciones"
        description="Mantente al día con todas las novedades de tu haras"
        icon={Bell}
        gradientFrom="from-primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Lista de notificaciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros modernos estilo pills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Izquierda: Stats y filtros */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Stats con ícono */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bell className="w-4 h-4 text-primary" />
                  {stats.no_leidas > 0 ? (
                    <>
                      <span className="font-semibold text-primary">{stats.no_leidas}</span>
                      <span>sin leer</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Sin pendientes</span>
                  )}
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-gray-200"></div>

                {/* Filtros estado - estilo pills */}
                <div className="flex items-center gap-1.5">
                  {(['todas', 'no-leidas', 'leidas'] as FiltroEstado[]).map((estado) => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filtroEstado === estado
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {estado === 'todas' ? 'Todas' : estado === 'no-leidas' ? 'No leídas' : 'Leídas'}
                    </button>
                  ))}
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-gray-200"></div>

                {/* Filtros tipo - estilo pills */}
                <div className="flex items-center gap-1.5">
                  {(['todas', 'evento', 'tarea', 'sistema', 'recordatorio'] as FiltroTipo[]).map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setFiltroTipo(tipo)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                        filtroTipo === tipo
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tipo === 'todas' ? 'Todas' : tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Derecha: Acción rápida */}
              {stats.no_leidas > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-all whitespace-nowrap"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {notificacionesFiltradas.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-base text-gray-600 max-w-md mx-auto">
                  {filtroEstado !== 'todas' || filtroTipo !== 'todas'
                    ? 'Intenta ajustar los filtros para ver más resultados'
                    : 'Estás al día con todas tus alertas. Te notificaremos cuando haya novedades.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notificacionesFiltradas.map((notif) => {
                  const colores = getColorTipo(notif.tipo);
                  const Icono = getIconoTipo(notif.tipo);

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notif.leida && 'bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm ${colores.icon}`}>
                          <Icono className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {notif.titulo}
                              </h4>
                              {!notif.leida && (
                                <Circle className="w-2 h-2 text-blue-600 fill-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                            {notif.mensaje}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {formatearTiempo(notif.creado_el)}
                            </span>
                            {notif.importante && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Importante
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.leida && (
                            <button
                              onClick={() => marcarComoLeida(notif.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEliminarNotificacion(notif.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón eliminar leídas */}
          {notificaciones.some(n => n.leida) && (
            <button
              onClick={handleEliminarLeidas}
              className="w-full py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar todas las leídas
            </button>
          )}
        </div>

        {/* Columna derecha - Configuración */}
        <div className="lg:col-span-1 space-y-6">
          {/* Configuración */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center shadow-sm">
                <Settings className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Preferencias</h3>
                <p className="text-xs text-gray-500">Gestiona tus notificaciones</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">Email</p>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        emailNotifications ? 'bg-brand-gold' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">Recibir por correo</p>
                </div>
              </div>

              {/* Push */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">Push</p>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        pushNotifications ? 'bg-brand-gold' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">Alertas en navegador</p>
                </div>
              </div>

              {/* SMS */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">SMS</p>
                    <button
                      onClick={() => setSmsNotifications(!smsNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        smsNotifications ? 'bg-brand-gold' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">Alertas por SMS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                href="/eventos"
                className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-300 hover:border-primary hover:shadow-md transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Ver Agenda</p>
                  <p className="text-xs text-gray-600">Próximos eventos</p>
                </div>
              </Link>
              <Link
                href="/caballos"
                className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-300 hover:border-primary hover:shadow-md transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Trophy className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Mis Caballos</p>
                  <p className="text-xs text-gray-600">Ver todos</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
