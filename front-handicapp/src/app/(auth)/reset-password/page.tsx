"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToaster();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Token inválido'); return; }
    if (!p1 || p1.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (p1 !== p2) { setError('Las contraseñas no coinciden'); return; }
    try {
      setLoading(true);
      await ApiClient.performPasswordReset(token, p1);
      toast('Contraseña actualizada', 'success');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3C2013] via-[#2A1609] to-[#1A0E06] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl mb-6">
            <img src="/logos/logo-icon-white.png" alt="HandicApp" className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Restablecer contraseña</h1>
          <p className="text-[#D2B48C]/80 text-sm">Ingresá tu nueva contraseña</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Nueva contraseña</label>
              <input type="password" value={p1} onChange={e => setP1(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all" placeholder="Mínimo 8 caracteres"/>
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Confirmar contraseña</label>
              <input type="password" value={p2} onChange={e => setP2(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all" placeholder="Repite tu contraseña"/>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"><p className="text-red-200 text-sm">{error}</p></div>}
            <button disabled={loading} className="w-full bg-gradient-to-r from-[#D2B48C] to-[#F5DEB3] text-[#3C2013] font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#D2B48C]/25 transition-all disabled:opacity-50">{loading ? 'Actualizando...' : 'Actualizar contraseña'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
