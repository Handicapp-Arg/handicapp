'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import TokenService, { type UserData } from '@/lib/services/tokenService';
import { appConfig } from '@/lib/config';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  telefono?: string;
  activo: boolean;
  establecimiento_id?: number;
  createdAt: string;
  updatedAt: string;
  rol?: {
    id: number;
    nombre: string;
    clave: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Cargar usuario desde TokenService
   */
  const loadUserFromStorage = useCallback(async () => {
    try {
      const isAuth = await TokenService.isAuthenticated();
      
      if (isAuth) {
        const userData = TokenService.getUserData();
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            nombre: userData.nombre,
            apellido: userData.apellido,
            role: userData.rol.clave,
            activo: userData.estado_usuario === 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            rol: userData.rol
          });
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      TokenService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Inicializar autenticación al cargar la app
   */
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  /**
   * Login de usuario
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${appConfig.apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Para recibir refresh token cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { user: userData, accessToken, expiresIn } = data.data;
        
        // Guardar tokens usando TokenService
        TokenService.setTokens(accessToken, expiresIn, userData);
        
        // Actualizar estado del contexto
        setUser({
          id: userData.id,
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          role: userData.rol.clave,
          activo: userData.estado_usuario === 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rol: userData.rol
        });
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout de usuario
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Limpiar tokens y llamar endpoint de logout
      await TokenService.logout();
      
      // Limpiar estado del contexto
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refrescar autenticación
   */
  const refreshAuth = async () => {
    await loadUserFromStorage();
  };

  /**
   * Configurar interceptor para auto-refresh de tokens
   */
  useEffect(() => {
    // Verificar tokens cada 5 minutos
    const tokenCheckInterval = setInterval(async () => {
      if (user && TokenService.isTokenExpiringSoon()) {
        try {
          const token = await TokenService.getValidAccessToken();
          if (!token) {
            // Si no se pudo refrescar, hacer logout
            await logout();
          }
        } catch (error) {
          console.error('Error checking token:', error);
          await logout();
        }
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(tokenCheckInterval);
  }, [user]);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};