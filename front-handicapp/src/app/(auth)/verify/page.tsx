"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [status, setStatus] = useState<'pending'|'ok'|'error'>('pending');
  const router = useRouter();
  const { toast } = useToaster();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) { setStatus('error'); return; }
      try {
        await ApiClient.verifyEmail(token);
        if (!cancelled) {
          setStatus('ok');
          toast('Cuenta verificada. Ahora podés iniciar sesión', 'success');
          setTimeout(() => router.push('/login'), 1200);
        }
      } catch (e) {
        if (!cancelled) setStatus('error');
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token, router, toast]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3C2013] via-[#2A1609] to-[#1A0E06] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl mb-6">
          <img src="/logos/logo-icon-white.png" alt="HandicApp" className="w-20 h-20" />
        </div>
        {status === 'pending' && <p className="text-white/80">Verificando tu cuenta...</p>}
        {status === 'ok' && <p className="text-emerald-200">¡Cuenta verificada!</p>}
        {status === 'error' && <p className="text-red-200">Token inválido o expirado. Pedí uno nuevo.</p>}
      </div>
    </div>
  );
}
