"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';
import { LOGOS } from '@/lib/constants/logos';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/utils/roleUtils';
import AuthManager from '@/lib/auth/AuthManager';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [status, setStatus] = useState<'pending'|'ok'|'error'>('pending');
  const [userData, setUserData] = useState<{ email: string; roleKey: string } | null>(null);
  const router = useRouter();
  const { toast } = useToaster();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) { setStatus('error'); return; }
      try {
        const response = await ApiClient.verifyEmail(token) as any;
        if (!cancelled) {
          setStatus('ok');
          toast('Cuenta verificada exitosamente', 'success');
          
          // Obtener datos del usuario desde la respuesta
          const roleKey = response?.data?.roleKey || 'propietario';
          const email = response?.data?.email || '';
          const accessToken = response?.data?.accessToken;
          const refreshToken = response?.data?.refreshToken;
          const user = response?.data?.user;
          
          setUserData({ email, roleKey });
          
          // Si hay tokens, autenticar automáticamente al usuario y redirigir al dashboard
          if (accessToken && refreshToken && user) {
            try {
              // Guardar tokens en AuthManager
              await AuthManager.getInstance().setAuthTokens({
                accessToken,
                refreshToken,
                user
              });
              
              // Redirigir directamente al dashboard (sin timeout para que sea inmediato)
              const dashboardRoute = ROLE_DASHBOARD_ROUTES[roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
              router.push(dashboardRoute);
            } catch (authError) {
              console.error('Error autenticando usuario:', authError);
              // Si falla la autenticación, redirigir al login
              const dashboardRoute = ROLE_DASHBOARD_ROUTES[roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
              router.push(`/login?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
            }
          } else {
            // Si no hay tokens, redirigir al login
            const dashboardRoute = ROLE_DASHBOARD_ROUTES[roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
            router.push(`/login?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
          }
        }
      } catch (e) {
        if (!cancelled) setStatus('error');
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token, router, toast]);

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Contenido */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:px-8">
        <div className="w-full max-w-md text-center">
          {/* Status Icon */}
          <div className="mb-8 flex justify-center">
            {status === 'pending' && (
              <div className="p-6 bg-blue-50 rounded-full">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'ok' && (
              <div className="p-6 bg-green-50 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="p-6 bg-red-50 rounded-full">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
            )}
          </div>

          {/* Title & Message */}
          <div className="mb-6">
            {status === 'pending' && (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  Verificando tu cuenta
                </h1>
                <p className="text-slate-600">
                  Estamos validando tu correo electrónico, por favor espera un momento...
                </p>
              </>
            )}
            {status === 'ok' && (
              <>
                <h1 className="text-3xl font-bold text-green-700 mb-3">
                  ¡Cuenta verificada!
                </h1>
                <p className="text-slate-600">
                  Tu correo ha sido verificado exitosamente. Serás redirigido al dashboard en unos segundos...
                </p>
              </>
            )}
            {status === 'error' && (
              <>
                <h1 className="text-3xl font-bold text-red-700 mb-3">
                  Error de verificación
                </h1>
                <p className="text-slate-600 mb-6">
                  El token es inválido o ha expirado. Por favor, solicita un nuevo enlace de verificación.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {status === 'ok' && userData && (
            <button
              onClick={async () => {
                try {
                  // Re-autenticar si es necesario
                  const authManager = AuthManager.getInstance();
                  const state = authManager.getState();
                  
                  if (state.isAuthenticated) {
                    // Si ya está autenticado, ir directo al dashboard
                    const dashboardRoute = ROLE_DASHBOARD_ROUTES[userData.roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
                    router.push(dashboardRoute);
                  } else {
                    // Si no está autenticado, ir al login
                    const dashboardRoute = ROLE_DASHBOARD_ROUTES[userData.roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
                    router.push(`/login?email=${encodeURIComponent(userData.email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
                  }
                } catch (e) {
                  const dashboardRoute = ROLE_DASHBOARD_ROUTES[userData.roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
                  router.push(`/login?email=${encodeURIComponent(userData.email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
                }
              }}
              className="w-full bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#0f172a] hover:shadow-lg transition-all duration-200"
            >
              Continuar al Dashboard
            </button>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#0f172a] hover:shadow-lg transition-all duration-200"
              >
                Volver al Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-white text-slate-700 font-semibold py-3.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Registrarse de nuevo
              </button>
            </div>
          )}
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
              Verificación de Cuenta
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Estamos verificando tu correo electrónico para activar tu cuenta en HandicApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
