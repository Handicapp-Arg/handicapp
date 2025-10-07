'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AuthService, { type UserData } from '@/lib/services/authService';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  rol: {
    id: number;
    nombre: string;
    clave: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Convertir UserData a User
   */
  const mapUserData = (userData: UserData): User => ({
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

  /**
   * Cargar usuario desde AuthService al inicializar
   */
  const loadUserFromStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Verificar autenticación usando AuthService
      const isAuthenticated = await AuthService.isAuthenticated();
      
      if (isAuthenticated) {
        const userData = AuthService.getCurrentUser();
        if (userData) {
          setUser(mapUserData(userData));
        }
      }
    } catch (error) {
      console.warn('Error cargando usuario:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Efecto para cargar usuario al montar el componente
   */
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  /**
   * Login de usuario usando AuthService
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Usar AuthService para login
      const userData = await AuthService.login(email, password);
      
      // Actualizar estado del contexto
      setUser(mapUserData(userData));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout de usuario usando AuthService
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Usar AuthService para logout
      await AuthService.logout();
      
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

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}