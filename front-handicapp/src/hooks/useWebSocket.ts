/**
 * Hook useWebSocket
 * Gestión de conexión WebSocket con React
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketClient } from '@/lib/socket/socketClient';
import Cookies from 'js-cookie';

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  socketId?: string;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const isInitialized = useRef(false);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Conectar al WebSocket
   */
  const connect = useCallback(async () => {
    // Evitar múltiples conexiones simultáneas
    if (state.isConnecting || socketClient.isConnected()) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Obtener token JWT de las cookies
      const token = Cookies.get('auth-token');
      
      if (!token) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: null,
        }));
        return;
      }

      // Conectar
      await socketClient.connect(token);

      setState({
        isConnected: true,
        isConnecting: false,
        error: null,
        socketId: socketClient.getSocketId(),
      });

      onConnect?.();

    } catch (error: any) {
      console.error('Error al conectar WebSocket:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message || 'Error de conexión',
      }));
      onError?.(error);
    }
  }, [state.isConnecting, onConnect, onError]);

  /**
   * Desconectar del WebSocket
   */
  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      socketId: undefined,
    });

    // Limpiar timer de reconexión
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
  }, []);

  /**
   * Reconectar manualmente
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [connect, disconnect]);

  /**
   * Escuchar evento específico
   */
  const on = useCallback((event: string, callback: Function) => {
    socketClient.on(event, callback);
  }, []);

  /**
   * Dejar de escuchar evento
   */
  const off = useCallback((event: string, callback: Function) => {
    socketClient.off(event, callback);
  }, []);

  /**
   * Unirse a un room
   */
  const joinRoom = useCallback((room: string) => {
    socketClient.joinRoom(room);
  }, []);

  /**
   * Salir de un room
   */
  const leaveRoom = useCallback((room: string) => {
    socketClient.leaveRoom(room);
  }, []);

  /**
   * Effect: Auto-conectar al montar
   */
  useEffect(() => {
    if (autoConnect && !isInitialized.current) {
      isInitialized.current = true;
      connect();
    }

    // Configurar listeners para eventos del socket
    const handleDisconnect = (reason: string) => {
      console.log('Socket desconectado:', reason);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: `Desconectado: ${reason}`,
      }));
      onDisconnect?.(reason);

      // Intentar reconectar después de 3 segundos
      if (reason !== 'io client disconnect') {
        reconnectTimer.current = setTimeout(() => {
          console.log('Intentando reconectar...');
          connect();
        }, 3000);
      }
    };

    const handleError = (error: any) => {
      console.error('Socket error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error de socket',
      }));
      onError?.(error);
    };

    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('error', handleError);

    // Cleanup
    return () => {
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('error', handleError);
      
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [autoConnect, connect, onDisconnect, onError]);

  /**
   * Effect: Verificar estado de conexión periódicamente
   */
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const isConnected = socketClient.isConnected();
      setState(prev => {
        if (prev.isConnected !== isConnected) {
          return {
            ...prev,
            isConnected,
            socketId: isConnected ? socketClient.getSocketId() : undefined,
          };
        }
        return prev;
      });
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(checkConnection);
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
}
