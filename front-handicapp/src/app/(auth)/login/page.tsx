'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthNew } from '../../../lib/hooks/useAuthNew';
import { useSearchParams } from 'next/navigation';
import { useToaster } from '@/components/ui/toaster';
import ApiClient from '@/lib/services/apiClient';
import AuthManager from '@/lib/auth/AuthManager';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login, isLoading: authLoading, error: authError } = useAuthNew();
  const params = useSearchParams();
  const checkEmail = useMemo(() => params.get('checkEmail') === '1', [params]);
  const emailParam = useMemo(() => params.get('email') || '', [params]);
  const { toast } = useToaster();
  const [resending, setResending] = useState(false);
  const shownInfoRef = useRef(false);

  useEffect(() => {
    if (checkEmail && !shownInfoRef.current) {
      shownInfoRef.current = true;
      toast(`Te enviamos un correo a ${emailParam || 'tu casilla'} para verificar la cuenta.`, { type: 'info', duration: 5000 });
    }
  }, [checkEmail, emailParam, toast]);

  const onResend = async () => {
    if (!emailParam) {
      toast('Ingresá tu email y reintentá', 'warning');
      return;
    }
    try {
      setResending(true);
      await ApiClient.resendVerification(emailParam);
      toast('Si el email existe, reenviamos el enlace de verificación', 'success');
    } catch (e: any) {
      toast(e?.message || 'No se pudo reenviar', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      // Si llegamos aquí, el login fue exitoso
      toast('Inicio de sesión exitoso', 'success');
      const state = AuthManager.getInstance().getState();
      const roleKey = state.user?.rol?.clave || 'user';
      // Redirección por rol: admin -> /admin, propietario/u otros -> home
      if (roleKey === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Error en login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3C2013] via-[#2A1609] to-[#1A0E06] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white/5 border border-white/15 rounded-2xl mb-6 p-4">
            <img
              src="/logos/logo-icon-white.png"
              alt="HandicApp"
              className="w-full h-full object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logos/logo-full-white.png'; }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-[#D2B48C]/80 text-sm">Accede a tu cuenta HandicApp</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {(error || authError) && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-200 text-sm">{error || authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || isLoading}
              className="w-full bg-gradient-to-r from-[#D2B48C] to-[#F5DEB3] text-[#3C2013] font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#D2B48C]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(authLoading || isLoading) ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {checkEmail && (
              <div className="mb-4 flex flex-col items-center gap-2 text-white/80 text-sm">
                <p>¿No te llegó el correo? Revisá Spam o reenviá el enlace.</p>
                <button onClick={onResend} disabled={resending} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15">
                  {resending ? 'Reenviando…' : 'Reenviar verificación'}
                </button>
              </div>
            )}
            <div className="mb-3">
              <button
                onClick={() => router.push('/forgot-password')}
                className="text-white/70 hover:text-white font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <p className="text-white/60 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-[#D2B48C] hover:text-[#F5DEB3] font-medium transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/40 text-xs">
            © 2025 HandicApp. Sistema de Gestión Equina.
          </p>
        </div>
      </div>
    </div>
  );
}