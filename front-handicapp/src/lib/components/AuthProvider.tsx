/**
 * AuthProvider - Proveedor de contexto simplificado
 * Solo inicializa AuthManager, no mantiene estado duplicado
 */

'use client';

import React, { ReactNode, useEffect } from 'react';
import AuthManager from '../auth/AuthManager';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Inicializar AuthManager al montar el componente
    AuthManager.getInstance();
  }, []);

  return <>{children}</>;
}