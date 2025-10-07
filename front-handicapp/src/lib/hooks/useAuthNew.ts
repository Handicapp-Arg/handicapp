/**
 * useAuthNew - Hook personalizado para autenticación usando AuthManager
 */

import { useState, useEffect, useCallback } from 'react';
import AuthManager, { type AuthState, type UserData } from '../auth/AuthManager';

export interface UseAuthReturn {
  // Estado
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuthNew(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>(() => 
    AuthManager.getInstance().getState()
  );

  // Suscribirse a cambios del AuthManager
  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    const unsubscribe = authManager.subscribe((newState) => {
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  // Método de login
  const login = useCallback(async (email: string, password: string) => {
    const authManager = AuthManager.getInstance();
    await authManager.login(email, password);
  }, []);

  // Método de logout
  const logout = useCallback(async () => {
    const authManager = AuthManager.getInstance();
    await authManager.logout();
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    // Esta funcionalidad se puede implementar en AuthManager si es necesaria
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    clearError,
  };
}