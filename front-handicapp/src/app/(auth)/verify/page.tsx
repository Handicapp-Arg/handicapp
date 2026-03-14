"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';
import { LOGOS } from '@/lib/constants/logos';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/utils/roleUtils';
import AuthManager from '@/lib/auth/AuthManager';
import { AuthBrandingPanel } from '../_components/AuthBrandingPanel';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');
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
          const roleKey = response?.data?.roleKey || 'propietario';
          const email = response?.data?.email || '';
          const accessToken = response?.data?.accessToken;
          const refreshToken = response?.data?.refreshToken;
          const user = response?.data?.user;
          setUserData({ email, roleKey });
          if (accessToken && refreshToken && user) {
            try {
              await AuthManager.getInstance().setAuthTokens({ accessToken, refreshToken, user });
              const dashboardRoute = ROLE_DASHBOARD_ROUTES[roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
              router.push(dashboardRoute);
            } catch {
              const dashboardRoute = ROLE_DASHBOARD_ROUTES[roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
              router.push(`/login?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
            }
          } else {
            const dashboardRoute = ROLE_DASHBOARD_ROUTES[roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
            router.push(`/login?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
          }
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token, router, toast]);

  return (
    <div className="min-h-screen w-full flex">
      {/* Left — Status side */}
      <div
        className="flex-1 flex flex-col min-h-screen relative"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle, rgba(30,41,59,0.055) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      >
        <div className="flex items-center px-7 pt-7">
          <img src={LOGOS.ICON_BROWN} alt="HandicApp" className="h-7 w-7 object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOGOS.FULL_BROWN; }} />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-[400px] text-center">
            {/* Status icon */}
            <div className="mb-8 flex justify-center">
              {status === 'pending' && (
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(175,147,111,0.08)', border: '1px solid rgba(175,147,111,0.2)' }}>
                  <Loader2 className="w-9 h-9 text-[#af936f] animate-spin" />
                </div>
              )}
              {status === 'ok' && (
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <XCircle className="w-9 h-9 text-red-500" />
                </div>
              )}
            </div>

            <div className="mb-8">
              {status === 'pending' && (
                <h1 className="auth-fade-up auth-fade-up-2 font-bold text-[#1e293b]" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.7rem, 4vw, 2.2rem)' }}>
                  Un momento…
                </h1>
              )}
              {status === 'ok' && (
                <h1 className="auth-fade-up auth-fade-up-2 font-bold text-green-700" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.7rem, 4vw, 2.2rem)' }}>
                  ¡Todo listo!
                </h1>
              )}
              {status === 'error' && (
                <>
                  <h1 className="auth-fade-up auth-fade-up-2 font-bold text-red-500 mb-2" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.7rem, 4vw, 2.2rem)' }}>
                    Link inválido.
                  </h1>
                  <p className="text-slate-400 text-[13px]">El token expiró. Solicitá un nuevo enlace.</p>
                </>
              )}
            </div>

            {/* Actions */}
            {status === 'ok' && userData && (
              <button
                onClick={async () => {
                  try {
                    const state = AuthManager.getInstance().getState();
                    const dashboardRoute = ROLE_DASHBOARD_ROUTES[userData.roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
                    if (state.isAuthenticated) {
                      router.push(dashboardRoute);
                    } else {
                      router.push(`/login?email=${encodeURIComponent(userData.email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
                    }
                  } catch {
                    const dashboardRoute = ROLE_DASHBOARD_ROUTES[userData.roleKey as keyof typeof ROLE_DASHBOARD_ROUTES] || '/propietario';
                    router.push(`/login?email=${encodeURIComponent(userData.email)}&redirectTo=${encodeURIComponent(dashboardRoute)}&verified=1`);
                  }
                }}
                className="relative w-full overflow-hidden bg-[#1e293b] text-white font-semibold py-3.5 rounded-lg text-sm tracking-wide hover:bg-[#273549] transition-colors duration-200 group"
              >
                <span className="relative z-10">Continuar al Dashboard</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#af936f]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="relative w-full overflow-hidden bg-[#1e293b] text-white font-semibold py-3.5 rounded-lg text-sm tracking-wide hover:bg-[#273549] transition-colors duration-200 group"
                >
                  <span className="relative z-10">Volver al Login</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#af936f]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full bg-white text-slate-600 font-medium py-3.5 rounded-lg text-sm border border-slate-200 hover:bg-slate-50 transition-colors duration-200 shadow-sm"
                >
                  Registrarse de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right — Branding panel */}
      <AuthBrandingPanel />
    </div>
  );
}
