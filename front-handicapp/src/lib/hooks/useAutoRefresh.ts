/**
 * useAutoRefresh Hook
 *
 * Hook para refrescar datos automáticamente con:
 * - Polling inteligente (solo cuando la pestaña está activa)
 * - Page Visibility API (pausa cuando cambias de pestaña)
 * - Cleanup automático
 * - Configuración flexible del intervalo
 *
 * @example
 * useAutoRefresh(fetchData, { interval: 30000 }); // Refresca cada 30s
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  /** Intervalo en milisegundos (default: 60000ms = 1min) */
  interval?: number;
  /** Si debe iniciar automáticamente (default: true) */
  enabled?: boolean;
  /** Solo refrescar cuando la pestaña está visible (default: true) */
  onlyWhenVisible?: boolean;
}

export function useAutoRefresh(
  refreshFn: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const {
    interval = 60000, // 1 minuto por defecto
    enabled = true,
    onlyWhenVisible = true
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Función para ejecutar el refresh
  const executeRefresh = useCallback(async () => {
    // Si solo debe refrescar cuando está visible, verificar
    if (onlyWhenVisible && !isVisibleRef.current) {
      return;
    }

    try {
      await refreshFn();
    } catch (error) {
      console.error('Error en auto-refresh:', error);
    }
  }, [refreshFn, onlyWhenVisible]);

  // Configurar Page Visibility API
  useEffect(() => {
    if (!onlyWhenVisible) return;

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;

      // Si la pestaña se vuelve visible, hacer refresh inmediato
      if (!document.hidden && enabled) {
        executeRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onlyWhenVisible, enabled, executeRefresh]);

  // Configurar intervalo de polling
  useEffect(() => {
    if (!enabled) {
      // Limpiar intervalo si está deshabilitado
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Iniciar intervalo
    intervalRef.current = setInterval(() => {
      executeRefresh();
    }, interval);

    // Cleanup al desmontar o cambiar dependencias
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, executeRefresh]);

  // Cleanup final
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
