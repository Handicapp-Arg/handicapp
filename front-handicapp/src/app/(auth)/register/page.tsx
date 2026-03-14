"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import ApiClient from '@/lib/services/apiClient';
import { LOGOS } from '@/lib/constants/logos';
import { Eye, EyeOff } from 'lucide-react';
import { AuthBrandingPanel } from '../_components/AuthBrandingPanel';
import { FloatingInput } from '../_components/FloatingInput';
import { registerSchema } from '@/lib/schemas/auth';

function getPasswordStrength(pwd: string): number {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

const FORM_BG = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'radial-gradient(ellipse at 0% 60%, rgba(175,147,111,0.05) 0%, transparent 55%), radial-gradient(circle, rgba(30,41,59,0.045) 1px, transparent 1px)',
  backgroundSize: 'auto, 22px 22px',
};

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [shaking, setShaking] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const shake = (msg: string) => { setError(msg); setShaking(true); };

    const validation = registerSchema.safeParse({ firstName, lastName, email, password, confirmPassword });
    if (!validation.success) {
      shake(validation.error.issues[0].message);
      return;
    }
    if (!agreed) {
      shake('Aceptá los términos para continuar'); return;
    }

    try {
      setLoading(true);
      await ApiClient.register({
        nombre: firstName.trim(),
        apellido: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      setTimeout(() => {
        const emailParam = encodeURIComponent(email.trim());
        router.push(`/login?checkEmail=1&email=${emailParam}`);
      }, 1600);
    } catch (err) {
      const e = err as { message?: string; details?: string[] };
      const details = Array.isArray(e?.details) ? e.details : undefined;
      setError(details?.[0] || e.message || 'Error al registrar usuario');
      setShaking(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col min-h-screen relative" style={FORM_BG}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-7 pt-7">
          <div className="flex items-center gap-2.5">
            <img src={LOGOS.ICON_BROWN} alt="HandicApp" className="h-8 w-8 object-contain"
              style={{ filter: 'brightness(0)' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOGOS.FULL_BROWN; }} />
            <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1e293b]/70 hidden sm:block">HandicApp</span>
          </div>
          <button onClick={() => router.push('/login')} className="text-[13px] text-slate-500 hover:text-[#1e293b] transition-colors">
            Iniciar sesión →
          </button>
        </div>

        {/* Mobile tagline */}
        <div className="lg:hidden px-7 pt-3">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#af936f]/70 font-semibold">Gestión Ecuestre</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-14">
          <div className="w-full max-w-[380px]">

            <div className="auth-fade-up auth-fade-up-1 w-7 h-[3px] rounded-full bg-[#af936f] mb-5" />
            <h1
              className="auth-fade-up auth-fade-up-1 font-bold text-[#1e293b] leading-[1.1] mb-8"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.9rem, 4vw, 2.4rem)' }}
            >
              Crear cuenta.
            </h1>

            <form onSubmit={handleSubmit} className={`space-y-3 ${shaking ? 'auth-shake' : ''}`} onAnimationEnd={() => setShaking(false)}>

              {/* Name row */}
              <div className="auth-fade-up auth-fade-up-2 grid grid-cols-2 gap-3">
                <FloatingInput type="text" name="firstName" autoComplete="given-name"
                  label="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <FloatingInput type="text" name="lastName" autoComplete="family-name"
                  label="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>

              {/* Email */}
              <div className="auth-fade-up auth-fade-up-3">
                <FloatingInput type="email" name="email" autoComplete="email"
                  label="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              {/* Password + strength */}
              <div className="auth-fade-up auth-fade-up-4 space-y-2">
                <FloatingInput
                  type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password"
                  label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required
                  rightSlot={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {password.length > 0 && (
                  <div className="flex items-center gap-2 px-0.5">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div key={lvl} className="h-[3px] flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: strength >= lvl ? strengthColor[strength] : '#e2e8f0' }} />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium transition-colors duration-300"
                      style={{ color: strengthColor[strength] || '#94a3b8', minWidth: 42 }}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="auth-fade-up auth-fade-up-4">
                <FloatingInput
                  type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" autoComplete="new-password"
                  label="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  error={passwordsMismatch}
                  success={passwordsMatch}
                  rightSlot={
                    <div className="flex items-center gap-1.5">
                      {(passwordsMatch || passwordsMismatch) && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: passwordsMatch ? '#22c55e' : '#ef4444' }} />
                      )}
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  }
                />
              </div>

              {/* Terms */}
              <div className="auth-fade-up auth-fade-up-5 flex items-center gap-2.5 pt-1">
                <button type="button" onClick={() => setAgreed(!agreed)}
                  className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 focus:outline-none"
                  style={{ borderColor: agreed ? '#af936f' : '#cbd5e1', backgroundColor: agreed ? '#af936f' : 'transparent' }}>
                  {agreed && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-[13px] text-slate-500">
                  Acepto los{' '}
                  <button type="button" className="text-[#af936f] hover:text-[#8f7657] font-medium transition-colors">términos</button>
                  {' '}y{' '}
                  <button type="button" className="text-[#af936f] hover:text-[#8f7657] font-medium transition-colors">privacidad</button>
                </span>
              </div>

              {error && (
                <div className="rounded-xl p-3.5 bg-red-50/70 border border-red-200 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="auth-fade-up auth-fade-up-5 pt-1">
                <button type="submit" disabled={loading}
                  className="relative w-full overflow-hidden text-white font-semibold py-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1a2535 100%)' }}
                >
                  <span className="relative z-10">{loading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#af936f]/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AuthBrandingPanel />
    </div>
  );
}
