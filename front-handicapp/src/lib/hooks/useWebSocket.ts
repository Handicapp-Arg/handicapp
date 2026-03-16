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
  const { autoConnect = true } = options;

  // Keep callbacks in refs so they never cause re-renders or stale closures
  const onConnectRef = useRef(options.onConnect);
  const onDisconnectRef = useRef(options.onDisconnect);
  const onErrorRef = useRef(options.onError);
  useEffect(() => { onConnectRef.current = options.onConnect; });
  useEffect(() => { onDisconnectRef.current = options.onDisconnect; });
  useEffect(() => { onErrorRef.current = options.onError; });

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const isInitialized = useRef(false);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  const connect = useCallback(async () => {
    if (isConnectingRef.current || socketClient.isConnected()) return;

    try {
      isConnectingRef.current = true;
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      const token = Cookies.get('auth-token');
      if (!token) {
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false, error: null }));
        return;
      }

      await socketClient.connect(token);

      setState({
        isConnected: true,
        isConnecting: false,
        error: null,
        socketId: socketClient.getSocketId(),
      });

      onConnectRef.current?.();
    } catch (error: any) {
      console.error('Error al conectar WebSocket:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message || 'Error de conexión',
      }));
      onErrorRef.current?.(error);
    } finally {
      isConnectingRef.current = false;
    }
  }, []); // stable — no deps

  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setState({ isConnected: false, isConnecting: false, error: null, socketId: undefined });
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [connect, disconnect]);

  const on = useCallback((event: string, callback: Function) => {
    socketClient.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback: Function) => {
    socketClient.off(event, callback);
  }, []);

  const joinRoom = useCallback((room: string) => {
    socketClient.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    socketClient.leaveRoom(room);
  }, []);

  // Auto-connect + socket event listeners — stable deps only
  useEffect(() => {
    if (autoConnect && !isInitialized.current) {
      isInitialized.current = true;
      connect();
    }

    const handleDisconnect = (reason: string) => {
      setState(prev => ({ ...prev, isConnected: false, error: `Desconectado: ${reason}` }));
      onDisconnectRef.current?.(reason);

      if (reason !== 'io client disconnect') {
        reconnectTimer.current = setTimeout(() => connect(), 3000);
      }
    };

    const handleError = (error: any) => {
      console.error('Socket error:', error);
      setState(prev => ({ ...prev, error: error.message || 'Error de socket' }));
      onErrorRef.current?.(error);
    };

    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('error', handleError);

    return () => {
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('error', handleError);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [autoConnect, connect]); // connect is now stable

  // Sync connection state every 5s
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const isConnected = socketClient.isConnected();
      setState(prev => {
        if (prev.isConnected !== isConnected) {
          return { ...prev, isConnected, socketId: isConnected ? socketClient.getSocketId() : undefined };
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(checkConnection);
  }, []);

  return { ...state, connect, disconnect, reconnect, on, off, joinRoom, leaveRoom };
}
