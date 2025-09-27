'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToaster } from '@/components/ui/Toaster';
import ApiClient from '@/lib/services/apiClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { show } = useToaster();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      
      // Usar ApiClient directamente para login
      const response = await ApiClient.login(email.trim(), password.trim());
      
      if (response && (response as any).success && (response as any).data) {
        const data = (response as any).data;
        
        // Guardar token en cookies seguras
        document.cookie = `auth-token=${data.token}; path=/; max-age=7200; SameSite=Strict; Secure=${window.location.protocol === 'https:' ? 'true' : 'false'}`;
        document.cookie = `role=${data.user.rol_id}; path=/; max-age=7200; SameSite=Strict; Secure=${window.location.protocol === 'https:' ? 'true' : 'false'}`;
        
        show('¡Bienvenido!', 'success', 'Login exitoso');
        
        // Redirección basada en rol
        const roleRoutes: Record<number, string> = {
          1: '/admin',
          2: '/establecimiento', 
          3: '/capataz',
          4: '/veterinario',
          5: '/empleado',
          6: '/propietario'
        };
        
        const dashboardRoute = roleRoutes[data.user.rol_id] || '/';
        
        setTimeout(() => {
          router.push(dashboardRoute);
        }, 500);
        
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-xl space-y-6 sm:space-y-8 transition-all duration-300 hover:shadow-2xl">
        <div className="space-y-2 text-center">
          <img src="/logos/logo-full-brown.png" alt="HandicApp Logo" className="h-10 sm:h-12 mx-auto mb-4 sm:mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-sm sm:text-base text-gray-600">Accede a tu cuenta para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 w-full">
          <div className="space-y-4">
            <Input
              type="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 text-base"
            />
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 text-base"
            />
          </div>

          {error && (
            <div className="p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            variant="brand"
            className="w-full" 
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </form>

        <div className="pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-sm text-gray-600">
            <Link 
              className="flex items-center gap-2 hover:text-amber-700 transition-colors duration-200 touch-manipulation" 
              href="/"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Volver al inicio</span>
            </Link>
            <div className="text-center">
              <span className="block sm:inline">¿No tienes cuenta? </span>
              <Link 
                className="text-amber-600 hover:text-amber-800 font-medium transition-colors duration-200 touch-manipulation" 
                href="/register"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}