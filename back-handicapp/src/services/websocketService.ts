/**
 * WebSocket Service
 * 
 * Servicio para manejar conexiones WebSocket en tiempo real con Socket.IO
 * Permite notificaciones push, actualizaciones en vivo y comunicación bidireccional
 * 
 * Características:
 * - Autenticación por JWT
 * - Rooms por usuario (user:{id})
 * - Eventos tipados y seguros
 * - Manejo de conexiones/desconexiones
 * - Logging de actividad
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../utils/logger';

// ===================================
// TIPOS Y INTERFACES
// ===================================

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userEmail?: string;
}

interface JWTPayload {
  id: number;
  email: string;
  rol?: {
    id: number;
    clave: string;
    nombre: string;
  };
}

interface NotificacionPayload {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  importante: boolean;
  url?: string;
  payload?: any;
}

interface NotificacionStats {
  total: number;
  no_leidas: number;
  leidas: number;
  importantes: number;
}

// ===================================
// EVENTOS DISPONIBLES
// ===================================

export enum WebSocketEvents {
  // Cliente → Servidor
  AUTHENTICATE = 'authenticate',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  
  // Servidor → Cliente
  AUTHENTICATED = 'authenticated',
  NOTIFICACION_NUEVA = 'notificacion:nueva',
  NOTIFICACION_LEIDA = 'notificacion:leida',
  NOTIFICACION_ELIMINADA = 'notificacion:eliminada',
  NOTIFICACIONES_CONTADOR = 'notificaciones:contador',
  NOTIFICACIONES_STATS = 'notificaciones:stats',
  
  // Sistema
  ERROR = 'error',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect'
}

// ===================================
// WEBSOCKET SERVICE
// ===================================

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<number, Set<string>> = new Map();

  /**
   * Inicializar Socket.IO server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.frontend_url || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    logger.debug('Socket.IO initialized');

    // Middleware de autenticación
    this.io.use((socket: AuthenticatedSocket, next) => {
      this.authenticateSocket(socket, next);
    });

    // Manejar conexiones
    this.io.on(WebSocketEvents.CONNECT, (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    logger.debug('WebSocket server ready');
  }

  /**
   * Autenticar socket mediante JWT
   */
  private authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void): void {
    try {
      // Obtener token desde handshake (query, auth o headers)
      const token = 
        socket.handshake.auth?.['token'] || 
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.query?.['token'] as string;

      if (!token) {
        logger.warn('WebSocket: Intento de conexión sin token', { 
          socketId: socket.id 
        });
        return next(new Error('Authentication error: No token provided'));
      }

      // Verificar token
      const decoded = jwt.verify(token, config.jwt_secret) as JWTPayload;

      // Agregar info de usuario al socket
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;

      logger.info('WebSocket: Socket autenticado', { 
        userId: decoded.id, 
        email: decoded.email,
        socketId: socket.id 
      });

      next();
    } catch (error: any) {
      logger.error('WebSocket: Error de autenticación', { 
        error: error.message,
        socketId: socket.id
      });
      next(new Error('Authentication error: Invalid token'));
    }
  }

  /**
   * Manejar nueva conexión autenticada
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    const userEmail = socket.userEmail!;

    logger.info('🟢 WebSocket: Usuario conectado', { 
      userId, 
      email: userEmail,
      socketId: socket.id,
      transport: socket.conn.transport.name
    });

    // Unir a room personal del usuario
    const userRoom = `user:${userId}`;
    socket.join(userRoom);

    // Registrar conexión
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socket.id);

    // Confirmar autenticación al cliente
    socket.emit(WebSocketEvents.AUTHENTICATED, {
      success: true,
      userId,
      room: userRoom,
      message: 'Conectado al servidor de notificaciones en tiempo real'
    });

    // Manejar desconexión
    socket.on(WebSocketEvents.DISCONNECT, (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Manejar errores
    socket.on('error', (error) => {
      logger.error('WebSocket: Error en socket', { 
        userId, 
        socketId: socket.id,
        error: error.message 
      });
    });
  }

  /**
   * Manejar desconexión
   */
  private handleDisconnection(socket: AuthenticatedSocket, reason: string): void {
    const userId = socket.userId!;
    const userEmail = socket.userEmail!;

    logger.info('🔴 WebSocket: Usuario desconectado', { 
      userId, 
      email: userEmail,
      socketId: socket.id,
      reason 
    });

    // Remover de usuarios conectados
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId)!.delete(socket.id);
      
      // Si no tiene más conexiones, remover del mapa
      if (this.connectedUsers.get(userId)!.size === 0) {
        this.connectedUsers.delete(userId);
        logger.info('Usuario sin conexiones activas', { userId });
      }
    }
  }

  /**
   * Emitir nueva notificación a un usuario
   */
  emitNotificacionNueva(userId: number, notificacion: NotificacionPayload): void {
    if (!this.io) {
      logger.warn('WebSocket: Intento de emitir sin servidor inicializado');
      return;
    }

    const userRoom = `user:${userId}`;
    
    this.io.to(userRoom).emit(WebSocketEvents.NOTIFICACION_NUEVA, {
      success: true,
      data: notificacion
    });

    logger.info('📨 WebSocket: Notificación emitida', { 
      userId, 
      tipo: notificacion.tipo,
      notificacionId: notificacion.id,
      importante: notificacion.importante
    });
  }

  /**
   * Emitir notificación marcada como leída
   */
  emitNotificacionLeida(userId: number, notificacionId: number): void {
    if (!this.io) return;

    const userRoom = `user:${userId}`;
    
    this.io.to(userRoom).emit(WebSocketEvents.NOTIFICACION_LEIDA, {
      success: true,
      data: { id: notificacionId }
    });

    logger.debug('✅ WebSocket: Notificación marcada como leída', { 
      userId, 
      notificacionId 
    });
  }

  /**
   * Emitir múltiples notificaciones marcadas como leídas
   */
  emitNotificacionesLeidas(userId: number, notificacionIds: number[]): void {
    if (!this.io) return;

    const userRoom = `user:${userId}`;
    
    this.io.to(userRoom).emit(WebSocketEvents.NOTIFICACION_LEIDA, {
      success: true,
      data: { ids: notificacionIds }
    });

    logger.debug('✅ WebSocket: Múltiples notificaciones marcadas como leídas', { 
      userId, 
      count: notificacionIds.length 
    });
  }

  /**
   * Emitir notificación eliminada
   */
  emitNotificacionEliminada(userId: number, notificacionId: number): void {
    if (!this.io) return;

    const userRoom = `user:${userId}`;
    
    this.io.to(userRoom).emit(WebSocketEvents.NOTIFICACION_ELIMINADA, {
      success: true,
      data: { id: notificacionId }
    });

    logger.debug('🗑️ WebSocket: Notificación eliminada', { 
      userId, 
      notificacionId 
    });
  }

  /**
   * Emitir múltiples notificaciones eliminadas
   */
  emitNotificacionesEliminadas(userId: number, notificacionIds: number[]): void {
    if (!this.io) return;

    const userRoom = `user:${userId}`;
    
    this.io.to(userRoom).emit(WebSocketEvents.NOTIFICACION_ELIMINADA, {
      success: true,
      data: { ids: notificacionIds }
    });

    logger.debug('🗑️ WebSocket: Múltiples notificaciones eliminadas', { 
      userId, 
      count: notificacionIds.length 
    });
  }

  /**
   * Emitir actualización del contador de notificaciones no leídas
   */
  emitContadorNoLeidas(userId: number, contador: number): void {
    if (!this.io) return;

    const userRoom = `user:${userId}`;
    
    this.io.to(userRoom).emit(WebSocketEvents.NOTIFICACIONES_CONTADOR, {
      success: true,
      data: contador
    });

    logger.debug('🔢 WebSocket: Contador actualizado', { userId, contador });
  }

  /**
   * Emitir estadísticas de notificaciones
   */
  emitEstadisticas(userId: number, stats: NotificacionStats): void {
    if (!this.io) return;

    const userRoom = `user:${userId}`;
    
    this.io.to(userRoom).emit(WebSocketEvents.NOTIFICACIONES_STATS, {
      success: true,
      data: stats
    });

    logger.debug('📊 WebSocket: Estadísticas emitidas', { userId, stats });
  }

  /**
   * Verificar si un usuario está conectado
   */
  isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  /**
   * Obtener número de conexiones de un usuario
   */
  getUserConnectionsCount(userId: number): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }

  /**
   * Obtener total de usuarios conectados
   */
  getTotalConnectedUsers(): number {
    return this.connectedUsers.size;
  }

  /**
   * Obtener total de sockets conectados
   */
  getTotalConnectedSockets(): number {
    let total = 0;
    this.connectedUsers.forEach(sockets => {
      total += sockets.size;
    });
    return total;
  }

  /**
   * Obtener estadísticas del servidor WebSocket
   */
  getServerStats(): {
    connected_users: number;
    total_sockets: number;
    server_initialized: boolean;
  } {
    return {
      connected_users: this.getTotalConnectedUsers(),
      total_sockets: this.getTotalConnectedSockets(),
      server_initialized: this.io !== null
    };
  }

  /**
   * Cerrar servidor WebSocket
   */
  async close(): Promise<void> {
    if (this.io) {
      logger.info('🔌 Cerrando servidor WebSocket...');
      await this.io.close();
      this.connectedUsers.clear();
      logger.info('✅ Servidor WebSocket cerrado');
    }
  }
}

// Exportar singleton
export const websocketService = new WebSocketService();
