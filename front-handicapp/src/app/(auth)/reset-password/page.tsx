"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';
import { LOGOS } from '@/lib/constants/logos';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AuthBrandingPanel } from '../_components/AuthBrandingPanel';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToaster();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Token inválido o expirado'); return; }
    if (!p1 || p1.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (p1 !== p2) { setError('Las contraseñas no coinciden'); return; }
    try {
      setLoading(true);
      await ApiClient.performPasswordReset(token, p1);
      toast('Contraseña actualizada correctamente', 'success');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar la contraseña');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left — Form side */}
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

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-14">
          <div className="w-full max-w-[380px]">
            <button onClick={() => router.push('/login')} className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-[#1e293b] transition-colors mb-8 group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Volver
            </button>

            <div className="auth-fade-up auth-fade-up-1 w-7 h-[3px] rounded-full bg-[#af936f] mb-5" />
            <h1
              className="auth-fade-up auth-fade-up-1 font-bold text-[#1e293b] leading-[1.1] mb-8"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.9rem, 4vw, 2.4rem)' }}
            >
              Nueva clave.
            </h1>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="auth-fade-up auth-fade-up-2 relative">
                <input type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)}
                  className="auth-input w-full px-4 py-3.5 pr-11 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#af936f] transition-all duration-200 text-sm"
                  placeholder="Nueva contraseña" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="auth-fade-up auth-fade-up-3 relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)}
                  className="auth-input w-full px-4 py-3.5 pr-11 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#af936f] transition-all duration-200 text-sm"
                  placeholder="Confirmar contraseña" required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <div className="rounded-xl p-3.5 bg-red-50/70 border border-red-200 text-xs text-red-600">{error}</div>}

              <div className="auth-fade-up auth-fade-up-4">
                <button type="submit" disabled={loading}
                  className="relative w-full overflow-hidden text-white font-semibold py-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1a2535 100%)' }}
                >
                  <span className="relative z-10">{loading ? 'Actualizando...' : 'Guardar nueva clave'}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#af936f]/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right — Branding panel */}
      <AuthBrandingPanel />
    </div>
  );
}
