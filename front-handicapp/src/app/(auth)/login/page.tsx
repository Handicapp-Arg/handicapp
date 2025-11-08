'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthNew } from '../../../lib/hooks/useAuthNew';
import { useSearchParams } from 'next/navigation';
import { useToaster } from '@/components/ui/toaster';
import ApiClient from '@/lib/services/apiClient';
import AuthManager from '@/lib/auth/AuthManager';
import { LOGOS } from '@/lib/constants/logos';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { login, isLoading: authLoading, error: authError } = useAuthNew();
  const params = useSearchParams();
  const checkEmail = useMemo(() => params.get('checkEmail') === '1', [params]);
  const emailParam = useMemo(() => params.get('email') || '', [params]);
  const { toast } = useToaster();
  const [resending, setResending] = useState(false);
  const shownInfoRef = useRef(false);

  useEffect(() => {
    // Garantiza que el primer render (SSR y primer render del cliente) sea estable
    setMounted(true);
  }, []);

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
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Iniciar Sesión</h1>
            <p className="text-slate-600">Ingresa tu correo y contraseña para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-[#1e293b] focus:ring-[#af936f] focus:ring-offset-0"
                />
                <span className="text-sm text-slate-600">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-[#af936f] hover:text-[#8f7657] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {(error || authError) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error || authError}</p>
              </div>
            )}

            {(() => {
              const submitting = mounted && (authLoading || isLoading);
              return (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#0f172a] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              );
            })()}
          </form>

          {/* Verificación de email */}
          {checkEmail && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 text-sm mb-2">¿No te llegó el correo? Revisa tu carpeta de Spam o reenvía el enlace.</p>
              <button 
                onClick={onResend} 
                disabled={resending} 
                className="px-4 py-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {resending ? 'Reenviando…' : 'Reenviar verificación'}
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-[#af936f] hover:text-[#8f7657] font-semibold transition-colors"
              >
                Crear cuenta
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual/Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8">
        <div className="relative bg-[#0f172a] overflow-hidden rounded-3xl h-full w-full shadow-2xl">
          {/* Pattern Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#0e445d]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#af936f]/20 rounded-full blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12 text-center">
            {/* Logo Icon */}
            <div className="mb-8">
              <img
                src={LOGOS.ICON_WHITE}
                alt="HandicApp"
                className="h-32 w-32 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOGOS.FULL_WHITE; }}
              />
            </div>
            
            {/* Main Message */}
            <h2 className="text-4xl font-bold text-white mb-4">
              Gestiona tu Pasión Ecuestre
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Administra el cuidado, salud y rendimiento de tus caballos desde una plataforma integral profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}