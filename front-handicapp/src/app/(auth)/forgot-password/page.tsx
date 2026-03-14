"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';
import { LOGOS } from '@/lib/constants/logos';
import { AuthBrandingPanel } from '../_components/AuthBrandingPanel';
import { FloatingInput } from '../_components/FloatingInput';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresá un email válido').min(1, 'Ingresá tu email'),
});

const FORM_BG = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'radial-gradient(ellipse at 0% 60%, rgba(175,147,111,0.05) 0%, transparent 55%), radial-gradient(circle, rgba(30,41,59,0.045) 1px, transparent 1px)',
  backgroundSize: 'auto, 22px 22px',
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const { toast } = useToaster();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalized = email.trim().toLowerCase();
    const validation = forgotPasswordSchema.safeParse({ email: normalized });
    if (!validation.success) { setError(validation.error.issues[0].message); setShaking(true); return; }
    try {
      setLoading(true);
      await ApiClient.sendPasswordReset(normalized);
      toast('Si el email existe, te enviamos instrucciones', 'success');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'No se pudo enviar el email');
      setShaking(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col min-h-screen relative" style={FORM_BG}>

        {/* Top bar */}
        <div className="flex items-center px-7 pt-7">
          <img src={LOGOS.ICON_BROWN} alt="HandicApp" className="h-8 w-8 object-contain"
            style={{ filter: 'brightness(0)' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOGOS.FULL_BROWN; }} />
          <span className="ml-2.5 text-[12px] font-bold tracking-[0.3em] uppercase text-[#1e293b]/70 hidden sm:block">HandicApp</span>
        </div>

        {/* Mobile tagline */}
        <div className="lg:hidden px-7 pt-3">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#af936f]/70 font-semibold">Gestión Ecuestre</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-14">
          <div className="w-full max-w-[380px]">

            <button onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-[#1e293b] transition-colors mb-8 group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Volver
            </button>

            <div className="auth-fade-up auth-fade-up-1 w-7 h-[3px] rounded-full bg-[#af936f] mb-5" />
            <h1
              className="auth-fade-up auth-fade-up-1 font-bold text-[#1e293b] leading-[1.1] mb-3"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.9rem, 4vw, 2.4rem)' }}
            >
              Sin problema.
            </h1>
            <p className="auth-fade-up auth-fade-up-2 text-[13px] text-slate-400 mb-8 leading-relaxed">
              Ingresá tu email y te mandamos un enlace para restablecer tu clave.
            </p>

            <form onSubmit={onSubmit} className={`space-y-3.5 ${shaking ? 'auth-shake' : ''}`} onAnimationEnd={() => setShaking(false)}>
              <div className="auth-fade-up auth-fade-up-3">
                <FloatingInput
                  type="email" name="email" autoComplete="email"
                  label="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl p-3.5 bg-red-50/70 border border-red-200 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="auth-fade-up auth-fade-up-4 pt-1">
                <button type="submit" disabled={loading}
                  className="relative w-full overflow-hidden text-white font-semibold py-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1a2535 100%)' }}
                >
                  <span className="relative z-10">{loading ? 'Enviando...' : 'Enviar enlace'}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#af936f]/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right — Branding */}
      <AuthBrandingPanel />
    </div>
  );
}
