"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/utils/roleUtils';
import AuthManager from '@/lib/auth/AuthManager';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">

        {/* Status icon */}
        <div className="mb-6 flex justify-center">
          {status === 'pending' && (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          )}
          {status === 'ok' && (
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>

        {/* Status message */}
        <div className="mb-6">
          {status === 'pending' && (
            <h1 className="text-xl font-bold text-gray-900">Verificando...</h1>
          )}
          {status === 'ok' && (
            <h1 className="text-xl font-bold text-gray-900">¡Cuenta verificada!</h1>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h1>
              <p className="text-sm text-gray-500">El token expiró. Solicitá un nuevo enlace.</p>
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
            className="w-full bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-md text-sm hover:bg-gray-700 transition-colors"
          >
            Continuar al Dashboard
          </button>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              Volver al Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-white text-gray-700 font-medium py-2.5 px-4 rounded-md text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Registrarse de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
