/**
 * Hook de Notificaciones en Tiempo Real
 * Usa React Query + WebSocket para actualizaciones automáticas
 */

'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { notificacionService, type Notificacion } from '../services/notificacionService';
import { useAuthNew } from './useAuthNew';

// ====================================
// TIPOS
// ====================================

interface UseNotificacionesOptions {
  autoLoad?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number;
  enableWebSocket?: boolean;
}

interface UseNotificacionesReturn {
  notificaciones: Notificacion[];
  noLeidas: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  marcarComoLeida: (id: number) => Promise<void>;
  marcarTodasComoLeidas: () => Promise<void>;
  eliminarNotificacion: (id: number) => Promise<void>;
}

// ====================================
// QUERY KEYS
// ====================================

const QUERY_KEYS = {
  notificaciones: ['notificaciones'] as const,
  contador: ['notificaciones', 'contador'] as const,
};

// ====================================
// HOOK PRINCIPAL
// ====================================

export function useNotificaciones(options: UseNotificacionesOptions = {}): UseNotificacionesReturn {
  const {
    autoLoad = true,
    enablePolling = false,
    pollingInterval = 30000, // 30 segundos
    enableWebSocket = true,
  } = options;

  const { user } = useAuthNew();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ====================================
  // QUERY: Obtener notificaciones
  // ====================================

  const {
    data: notificaciones = [],
    isLoading: loading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: QUERY_KEYS.notificaciones,
    queryFn: async () => {
      const result = await notificacionService.obtenerNotificaciones({ limit: 50 });
      return result || [];
    },
    enabled: autoLoad && !!user,
    staleTime: enablePolling ? pollingInterval : 5 * 60 * 1000, // 5 minutos si no hay polling
    refetchInterval: enablePolling ? pollingInterval : false,
    refetchOnWindowFocus: true,
  });

  // ====================================
  // CONTADOR DE NO LEÍDAS
  // ====================================

  const noLeidas = notificaciones.filter((n: Notificacion) => !n.leida).length;

  // ====================================
  // MUTATIONS
  // ====================================

  const marcarLeidaMutation = useMutation({
    mutationFn: (id: number) => notificacionService.marcarComoLeida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificaciones });
    },
  });

  const marcarTodasLeidasMutation = useMutation({
    mutationFn: () => notificacionService.marcarTodasComoLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificaciones });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => notificacionService.eliminarNotificacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificaciones });
    },
  });

  // ====================================
  // WEBSOCKET: Escuchar notificaciones en tiempo real
  // ====================================

  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || !user) return;

    // Obtener el token de autenticación
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      console.warn('No se encontró token para WebSocket');
      return;
    }

    try {
      // Conectar al WebSocket del backend
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.NEXT_PUBLIC_WS_URL || 'localhost:3001';
      const wsUrl = `${wsProtocol}//${wsHost}?token=${token}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // connected
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Detectar notificaciones nuevas
          if (data.type === 'notificacion:nueva' || data.event === 'notificacion:nueva') {
            // Invalidar queries para refrescar datos
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificaciones });
            
            // Opcional: Mostrar notificación del navegador
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(data.titulo || 'Nueva notificación', {
                body: data.mensaje || '',
                icon: '/logos/logo-192x192.png',
                tag: `notif-${data.id}`,
              });
            }
          }
        } catch (err) {
          console.error('Error procesando mensaje WebSocket:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
      };

      ws.onclose = () => {
        wsRef.current = null;

        // Reintentar conexión después de 5 segundos
        if (enableWebSocket) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
    }
  }, [enableWebSocket, user, queryClient]);

  // Conectar WebSocket al montar
  useEffect(() => {
    if (enableWebSocket && user) {
      connectWebSocket();
    }

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enableWebSocket, user, connectWebSocket]);

  // ====================================
  // API PÚBLICA
  // ====================================

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  const marcarComoLeida = useCallback(async (id: number) => {
    await marcarLeidaMutation.mutateAsync(id);
  }, [marcarLeidaMutation]);

  const marcarTodasComoLeidas = useCallback(async () => {
    await marcarTodasLeidasMutation.mutateAsync();
  }, [marcarTodasLeidasMutation]);

  const eliminarNotificacion = useCallback(async (id: number) => {
    await eliminarMutation.mutateAsync(id);
  }, [eliminarMutation]);

  return {
    notificaciones,
    noLeidas,
    loading,
    error: error as Error | null,
    refetch,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
  };
}

// ====================================
// HOOK SIMPLE: Solo contador
// ====================================

export function useNotificacionesCount() {
  const { user } = useAuthNew();

  const { data: count = 0 } = useQuery({
    queryKey: QUERY_KEYS.contador,
    queryFn: async () => {
      const result = await notificacionService.obtenerContadorNoLeidas();
      return result || 0;
    },
    enabled: !!user,
    staleTime: 10000, // 10 segundos
    refetchInterval: 30000, // Refrescar cada 30 segundos
    refetchOnWindowFocus: true,
  });

  return { noLeidas: count };
}
