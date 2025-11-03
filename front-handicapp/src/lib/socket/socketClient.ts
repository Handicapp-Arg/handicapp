/**
 * Cliente WebSocket para HandicApp
 * Gestión de conexión Socket.IO con autenticación JWT
 */

import { io, Socket } from 'socket.io-client';

// Tipos de eventos del servidor
export interface ServerToClientEvents {
  authenticated: () => void;
  'notificacion:nueva': (data: any) => void;
  'notificacion:leida': (data: any) => void;
  'notificacion:eliminada': (data: { id: number }) => void;
  'notificaciones:contador': (data: { count: number }) => void;
  'notificaciones:stats': (data: any) => void;
  error: (data: { message: string }) => void;
  disconnect: (reason: string) => void;
}

// Tipos de eventos del cliente
export interface ClientToServerEvents {
  authenticate: (token: string) => void;
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
}

type SocketClientType = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketClient {
  private socket: SocketClientType | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // URL del servidor WebSocket (mismo que la API pero puerto específico si es necesario)
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        return resolve();
      }

      if (this.socket?.connected) {
        return resolve();
      }

      this.isConnecting = true;
      this.token = token;

      try {
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 10000,
          autoConnect: false,
        }) as SocketClientType;

        // Eventos de conexión
        this.socket.on('connect', () => {
          this.reconnectAttempts = 0;
          
          // Autenticar inmediatamente
          if (this.token && this.socket) {
            this.socket.emit('authenticate', this.token);
          }
        });

        this.socket.on('authenticated', () => {
          this.isConnecting = false;
          resolve();
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
          this.isConnecting = false;
          
          // Notificar a los listeners
          this.notifyListeners('error', error);
          
          reject(new Error(error.message || 'Error de socket'));
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnecting = false;
          
          // Notificar a los listeners
          this.notifyListeners('disconnect', reason);

          // Reconectar si no fue desconexión intencional
          if (reason === 'io server disconnect') {
            // El servidor forzó la desconexión, reconectar
            this.socket?.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
          this.reconnectAttempts++;
          this.isConnecting = false;

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Máximo de intentos de reconexión alcanzado'));
          }
        });

        // Configurar listeners de eventos del servidor
        this.setupServerListeners();

        // Iniciar conexión
        this.socket.connect();

      } catch (error) {
        console.error('Socket connection failed:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Configurar listeners para eventos del servidor
   */
  private setupServerListeners() {
    if (!this.socket) return;

    // Notificación nueva
    this.socket.on('notificacion:nueva', (data) => {
      this.notifyListeners('notificacion:nueva', data);
    });

    // Notificación leída
    this.socket.on('notificacion:leida', (data) => {
      this.notifyListeners('notificacion:leida', data);
    });

    // Notificación eliminada
    this.socket.on('notificacion:eliminada', (data) => {
      this.notifyListeners('notificacion:eliminada', data);
    });

    // Contador actualizado
    this.socket.on('notificaciones:contador', (data) => {
      this.notifyListeners('notificaciones:contador', data);
    });

    // Estadísticas actualizadas
    this.socket.on('notificaciones:stats', (data) => {
      this.notifyListeners('notificaciones:stats', data);
    });
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtener ID del socket
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Agregar listener para un evento
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  /**
   * Remover listener de un evento
   */
  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Notificar a todos los listeners de un evento
   */
  private notifyListeners(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de ${event}:`, error);
        }
      });
    }
  }

  /**
   * Unirse a un room específico
   */
  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', room);
    }
  }

  /**
   * Salir de un room
   */
  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', room);
    }
  }

  /**
   * Reconectar manualmente
   */
  reconnect() {
    if (this.token && !this.isConnected()) {
      this.connect(this.token).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }
  }
}

// Exportar instancia singleton
export const socketClient = new SocketClient();
export default socketClient;
