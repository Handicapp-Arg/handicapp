/**
 * Hook useNotifications
 * Gestión de notificaciones en tiempo real con WebSocket
 */

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { notificacionService, Notificacion } from '@/lib/services/notificacionService';
import toast from 'react-hot-toast';

interface NotificationStats {
  total: number;
  no_leidas: number;
  leidas: number;
  importantes: number;
}

export function useNotifications() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [contador, setContador] = useState(0);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    no_leidas: 0,
    leidas: 0,
    importantes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Conectar al WebSocket
  const { isConnected, on, off } = useWebSocket({
    autoConnect: true,
    onConnect: () => {
      console.log('✅ WebSocket conectado - Notificaciones en tiempo real activas');
      cargarNotificaciones();
    },
    onError: (err) => {
      console.error('❌ Error en WebSocket:', err);
      setError('Error de conexión en tiempo real');
    },
  });

  /**
   * Cargar notificaciones iniciales
   */
  const cargarNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [notifs, estadisticas] = await Promise.all([
        notificacionService.obtenerNotificaciones({ limit: 50 }),
        notificacionService.obtenerEstadisticas(),
      ]);

      // Asegurar que notifs sea siempre un array
      const notificacionesArray = Array.isArray(notifs) ? notifs : [];
      setNotificaciones(notificacionesArray);

      setStats({
        total: estadisticas.total,
        no_leidas: estadisticas.no_leidas,
        leidas: estadisticas.leidas,
        importantes: estadisticas.importantes || 0,
      });
      setContador(estadisticas.no_leidas);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar notificaciones';
      console.error('❌ [useNotifications] Error al cargar notificaciones:', error);
      setError(errorMessage);
      // En caso de error, establecer array vacío
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marcar notificación como leída
   */
  const marcarComoLeida = useCallback(async (id: number) => {
    try {
      await notificacionService.marcarComoLeida(id);
      
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
      setContador(prev => Math.max(0, prev - 1));
      setStats(prev => ({
        ...prev,
        no_leidas: Math.max(0, prev.no_leidas - 1),
        leidas: prev.leidas + 1,
      }));

    } catch (error) {
      console.error('Error al marcar como leída:', error);
      toast.error('Error al actualizar notificación');
    }
  }, []);

  /**
   * Marcar todas como leídas
   */
  const marcarTodasComoLeidas = useCallback(async () => {
    try {
      await notificacionService.marcarTodasComoLeidas();
      
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setContador(0);
      setStats(prev => ({
        ...prev,
        no_leidas: 0,
        leidas: prev.total,
      }));

      toast.success('Todas las notificaciones marcadas como leídas');

    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      toast.error('Error al actualizar notificaciones');
    }
  }, []);

  /**
   * Eliminar notificación
   */
  const eliminarNotificacion = useCallback(async (id: number) => {
    try {
      const notif = notificaciones.find(n => n.id === id);
      await notificacionService.eliminarNotificacion(id);
      
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      
      if (notif && !notif.leida) {
        setContador(prev => Math.max(0, prev - 1));
        setStats(prev => ({
          ...prev,
          no_leidas: Math.max(0, prev.no_leidas - 1),
          total: Math.max(0, prev.total - 1),
        }));
      } else {
        setStats(prev => ({
          ...prev,
          leidas: Math.max(0, prev.leidas - 1),
          total: Math.max(0, prev.total - 1),
        }));
      }

    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      toast.error('Error al eliminar notificación');
    }
  }, [notificaciones]);

  /**
   * Eliminar todas las leídas
   */
  const eliminarLeidas = useCallback(async () => {
    try {
      await notificacionService.eliminarLeidas();
      
      setNotificaciones(prev => prev.filter(n => !n.leida));
      setStats(prev => ({
        ...prev,
        leidas: 0,
        total: prev.no_leidas,
      }));

      toast.success('Notificaciones leídas eliminadas');

    } catch (error) {
      console.error('Error al eliminar leídas:', error);
      toast.error('Error al eliminar notificaciones');
    }
  }, []);

  /**
   * Effect: Configurar listeners de WebSocket
   */
  useEffect(() => {
    if (!isConnected) return;

    // Nueva notificación
    const handleNuevaNotificacion = (data: Notificacion) => {
      
      setNotificaciones(prev => [data, ...prev]);
      setContador(prev => prev + 1);
      setStats(prev => ({
        total: prev.total + 1,
        no_leidas: prev.no_leidas + 1,
        leidas: prev.leidas,
        importantes: data.importante ? prev.importantes + 1 : prev.importantes,
      }));

      // Mostrar toast con la notificación
      toast.success(
        `${data.titulo}: ${data.mensaje}`,
        {
          duration: 5000,
          position: 'top-right',
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }
      );

      // Reproducir sonido de notificación (opcional)
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {
            // Ignorar si el usuario no ha interactuado aún
          });
        } catch {
          // Ignorar errores de audio
        }
      }
    };

    // Notificación leída
    const handleNotificacionLeida = (data: { id: number }) => {
      
      setNotificaciones(prev =>
        prev.map(n => (n.id === data.id ? { ...n, leida: true } : n))
      );
      setContador(prev => Math.max(0, prev - 1));
      setStats(prev => ({
        ...prev,
        no_leidas: Math.max(0, prev.no_leidas - 1),
        leidas: prev.leidas + 1,
      }));
    };

    // Notificación eliminada
    const handleNotificacionEliminada = (data: { id: number }) => {
      
      const notif = notificaciones.find(n => n.id === data.id);
      setNotificaciones(prev => prev.filter(n => n.id !== data.id));
      
      if (notif) {
        if (!notif.leida) {
          setContador(prev => Math.max(0, prev - 1));
          setStats(prev => ({
            ...prev,
            no_leidas: Math.max(0, prev.no_leidas - 1),
            total: Math.max(0, prev.total - 1),
          }));
        } else {
          setStats(prev => ({
            ...prev,
            leidas: Math.max(0, prev.leidas - 1),
            total: Math.max(0, prev.total - 1),
          }));
        }
      }
    };

    // Contador actualizado
    const handleContadorActualizado = (data: { count: number }) => {
      console.log('📊 Contador actualizado:', data.count);
      setContador(data.count);
    };

    // Estadísticas actualizadas
    const handleStatsActualizadas = (data: NotificationStats) => {
      setStats(data);
    };

    // Registrar listeners
    on('notificacion:nueva', handleNuevaNotificacion);
    on('notificacion:leida', handleNotificacionLeida);
    on('notificacion:eliminada', handleNotificacionEliminada);
    on('notificaciones:contador', handleContadorActualizado);
    on('notificaciones:stats', handleStatsActualizadas);

    // Cleanup
    return () => {
      off('notificacion:nueva', handleNuevaNotificacion);
      off('notificacion:leida', handleNotificacionLeida);
      off('notificacion:eliminada', handleNotificacionEliminada);
      off('notificaciones:contador', handleContadorActualizado);
      off('notificaciones:stats', handleStatsActualizadas);
    };
  }, [isConnected, on, off, notificaciones]);

  /**
   * Effect: Cargar notificaciones iniciales
   */
  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  return {
    // Estado
    notificaciones,
    contador,
    stats,
    loading,
    error,
    isConnected,

    // Acciones
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    eliminarLeidas,
  };
}
